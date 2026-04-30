"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBookings = exports.getBookingById = exports.confirmDriverDelivery = exports.confirmDriverPickup = exports.rejectDriverBooking = exports.acceptDriverBooking = exports.getDriverBookingHistory = exports.getPendingBookingsForVehicle = exports.updateBooking = exports.createBooking = void 0;
const prisma_1 = require("../../utils/prisma");
const uuid_1 = require("uuid");
const distance_1 = require("../../utils/distance");
const getRoute_1 = require("../../utils/getRoute");
const tracking_socket_1 = require("../../sockets/tracking.socket");
const createBooking = async (data) => {
    try {
        const { vehicleId, pickupLat, pickupLng, pickupAddress, customerId, userId } = data;
        const customer = await prisma_1.prisma.customer.findUnique({
            where: { id: customerId }
        });
        if (!customer)
            throw new Error("CUSTOMER_NOT_FOUND");
        const vehicle = await prisma_1.prisma.vehicleDetails.findUnique({
            where: { id: vehicleId }
        });
        if (!vehicle)
            throw new Error("VEHICLE_NOT_FOUND");
        if (vehicle.status === "BUSY")
            throw new Error("VEHICLE_BUSY");
        const destLat = customer.lat;
        const destLng = customer.lng;
        const destAddress = customer.address;
        const { etaMinutes, distanceKm } = await (0, distance_1.getDistanceAndTime)({ lat: pickupLat, lng: pickupLng }, { lat: destLat, lng: destLng });
        const route = await (0, getRoute_1.getRoute)(pickupLat, pickupLng, destLat, destLng);
        const booking = await prisma_1.prisma.$transaction(async (tx) => {
            const created = await tx.vehicleBooking.create({
                data: {
                    vehicleId,
                    pickupLat,
                    pickupLng,
                    pickupAddress,
                    destLat,
                    destLng,
                    destAddress,
                    customerId,
                    userId,
                    status: "PENDING",
                    trackingToken: (0, uuid_1.v4)(),
                    bookingId: `BK${Date.now()}`,
                    route: route
                }
            });
            await tx.vehicleDetails.update({
                where: { id: vehicleId },
                data: { status: "BUSY" }
            });
            return created;
        });
        return {
            booking,
            etaMinutes,
            distanceKm
        };
    }
    catch (err) {
        console.error("Error creating booking", err);
        throw err;
    }
};
exports.createBooking = createBooking;
const updateBooking = async (bookingId, data) => {
    try {
        const booking = await prisma_1.prisma.vehicleBooking.findUnique({
            where: { id: bookingId }
        });
        if (!booking)
            throw new Error("BOOKING_NOT_FOUND");
        if (booking.status === "COMPLETED") {
            throw new Error("CANNOT_UPDATE_ACTIVE_BOOKING");
        }
        let newCustomerId = booking.customerId;
        let destLat = booking.destLat;
        let destLng = booking.destLng;
        let destAddress = booking.destAddress;
        if (data.customerId && data.customerId !== booking.customerId) {
            const customer = await prisma_1.prisma.customer.findUnique({
                where: { id: data.customerId }
            });
            if (!customer)
                throw new Error("CUSTOMER_NOT_FOUND");
            newCustomerId = data.customerId;
            destLat = customer.lat;
            destLng = customer.lng;
            destAddress = customer.address;
        }
        let newVehicleId = booking.vehicleId;
        if (data.vehicleId && data.vehicleId !== booking.vehicleId) {
            const vehicle = await prisma_1.prisma.vehicleDetails.findUnique({
                where: { id: data.vehicleId }
            });
            if (!vehicle)
                throw new Error("VEHICLE_NOT_FOUND");
            if (vehicle.status === "BUSY")
                throw new Error("VEHICLE_NOT_AVAILABLE");
            newVehicleId = data.vehicleId;
        }
        const updated = await prisma_1.prisma.$transaction(async (tx) => {
            var _a, _b, _c, _d;
            if (newVehicleId !== booking.vehicleId) {
                await tx.vehicleDetails.update({
                    where: { id: booking.vehicleId },
                    data: { status: "AVAILABLE" }
                });
                await tx.vehicleDetails.update({
                    where: { id: newVehicleId },
                    data: { status: "BUSY" }
                });
            }
            const updatedBooking = await tx.vehicleBooking.update({
                where: { id: bookingId },
                data: {
                    vehicleId: newVehicleId,
                    pickupLat: (_a = data.pickupLat) !== null && _a !== void 0 ? _a : booking.pickupLat,
                    pickupLng: (_b = data.pickupLng) !== null && _b !== void 0 ? _b : booking.pickupLng,
                    pickupAddress: (_c = data.pickupAddress) !== null && _c !== void 0 ? _c : booking.pickupAddress,
                    destLat,
                    destLng,
                    destAddress,
                    customerId: newCustomerId,
                    status: (_d = data.status) !== null && _d !== void 0 ? _d : booking.status
                }
            });
            return updatedBooking; // 🔥 VERY IMPORTANT
        });
        // 🔥 START SIMULATION WHEN CONFIRMED
        if (data.status === "ONGOING") {
            console.log("Tracking simulation started!!!!!");
        }
        return { updated };
    }
    catch (err) {
        console.error("Error updating booking", err);
        throw err;
    }
};
exports.updateBooking = updateBooking;
const getPendingBookingsForVehicle = async (vehicleId) => {
    try {
        return await prisma_1.prisma.vehicleBooking.findMany({
            where: {
                vehicleId,
                status: "PENDING",
                isActive: true
            },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                Customer: true,
                VehicleDetails: true
            }
        });
    }
    catch (err) {
        console.error("Error fetching driver bookings", err);
        throw err;
    }
};
exports.getPendingBookingsForVehicle = getPendingBookingsForVehicle;
const getDriverBookingHistory = async (vehicleId) => {
    try {
        return await prisma_1.prisma.vehicleBooking.findMany({
            where: {
                vehicleId,
                status: {
                    in: ["ONGOING", "LOADING", "COMPLETED"]
                }
            },
            orderBy: {
                updatedAt: "desc"
            },
            include: {
                Customer: true,
                VehicleDetails: true
            }
        });
    }
    catch (err) {
        console.error("Error fetching driver booking history", err);
        throw err;
    }
};
exports.getDriverBookingHistory = getDriverBookingHistory;
const acceptDriverBooking = async (bookingId, vehicleId, lat, lng) => {
    try {
        const booking = await prisma_1.prisma.vehicleBooking.findFirst({
            where: {
                id: bookingId,
                vehicleId,
                status: "PENDING",
                isActive: true
            }
        });
        if (!booking)
            throw new Error("BOOKING_NOT_FOUND");
        const updated = await prisma_1.prisma.$transaction(async (tx) => {
            await tx.trackingLog.create({
                data: {
                    bookingId,
                    lat,
                    lng
                }
            });
            await tx.vehicleDetails.update({
                where: { id: vehicleId },
                data: {
                    status: "BUSY",
                    lastLat: lat,
                    lastLng: lng,
                    lastUpdated: new Date()
                }
            });
            return tx.vehicleBooking.update({
                where: { id: bookingId },
                data: {
                    status: "ONGOING",
                    lastLat: lat,
                    lastLng: lng,
                    lastUpdated: new Date()
                },
                include: {
                    Customer: true,
                    VehicleDetails: true
                }
            });
        });
        (0, tracking_socket_1.sendLocationUpdate)(bookingId, lat, lng);
        (0, tracking_socket_1.sendVehicleLocationUpdate)(vehicleId, lat, lng);
        return updated;
    }
    catch (err) {
        console.error("Error accepting driver booking", err);
        throw err;
    }
};
exports.acceptDriverBooking = acceptDriverBooking;
const rejectDriverBooking = async (bookingId, vehicleId) => {
    try {
        const booking = await prisma_1.prisma.vehicleBooking.findFirst({
            where: {
                id: bookingId,
                vehicleId,
                status: "PENDING",
                isActive: true
            }
        });
        if (!booking)
            throw new Error("BOOKING_NOT_FOUND");
        const updated = await prisma_1.prisma.$transaction(async (tx) => {
            await tx.vehicleDetails.update({
                where: { id: vehicleId },
                data: { status: "AVAILABLE" }
            });
            return tx.vehicleBooking.update({
                where: { id: bookingId },
                data: {
                    status: "CANCELLED",
                    isActive: false
                }
            });
        });
        return updated;
    }
    catch (err) {
        console.error("Error rejecting driver booking", err);
        throw err;
    }
};
exports.rejectDriverBooking = rejectDriverBooking;
const confirmDriverPickup = async (bookingId, vehicleId, lat, lng) => {
    try {
        const booking = await prisma_1.prisma.vehicleBooking.findFirst({
            where: {
                id: bookingId,
                vehicleId,
                status: "ONGOING",
                isActive: true
            }
        });
        if (!booking)
            throw new Error("BOOKING_NOT_FOUND");
        const updateLocation = lat !== undefined && lng !== undefined;
        const updated = await prisma_1.prisma.$transaction(async (tx) => {
            if (updateLocation) {
                await tx.trackingLog.create({
                    data: {
                        bookingId,
                        lat,
                        lng
                    }
                });
                await tx.vehicleDetails.update({
                    where: { id: vehicleId },
                    data: {
                        lastLat: lat,
                        lastLng: lng,
                        lastUpdated: new Date()
                    }
                });
            }
            return tx.vehicleBooking.update({
                where: { id: bookingId },
                data: {
                    status: "LOADING",
                    ...(updateLocation
                        ? {
                            lastLat: lat,
                            lastLng: lng,
                            lastUpdated: new Date()
                        }
                        : {})
                },
                include: {
                    Customer: true,
                    VehicleDetails: true
                }
            });
        });
        if (updateLocation) {
            (0, tracking_socket_1.sendLocationUpdate)(bookingId, lat, lng);
            (0, tracking_socket_1.sendVehicleLocationUpdate)(vehicleId, lat, lng);
        }
        return updated;
    }
    catch (err) {
        console.error("Error confirming pickup", err);
        throw err;
    }
};
exports.confirmDriverPickup = confirmDriverPickup;
const confirmDriverDelivery = async (bookingId, vehicleId, lat, lng) => {
    try {
        const booking = await prisma_1.prisma.vehicleBooking.findFirst({
            where: {
                id: bookingId,
                vehicleId,
                status: { in: ["ONGOING", "LOADING"] },
                isActive: true
            }
        });
        if (!booking)
            throw new Error("BOOKING_NOT_FOUND");
        const finalLat = lat !== null && lat !== void 0 ? lat : booking.destLat;
        const finalLng = lng !== null && lng !== void 0 ? lng : booking.destLng;
        const updated = await prisma_1.prisma.$transaction(async (tx) => {
            await tx.trackingLog.create({
                data: {
                    bookingId,
                    lat: finalLat,
                    lng: finalLng
                }
            });
            await tx.vehicleDetails.update({
                where: { id: vehicleId },
                data: {
                    status: "AVAILABLE",
                    lastLat: finalLat,
                    lastLng: finalLng,
                    lastUpdated: new Date()
                }
            });
            return tx.vehicleBooking.update({
                where: { id: bookingId },
                data: {
                    status: "COMPLETED",
                    isActive: false,
                    lastLat: finalLat,
                    lastLng: finalLng,
                    lastUpdated: new Date()
                },
                include: {
                    Customer: true,
                    VehicleDetails: true
                }
            });
        });
        (0, tracking_socket_1.sendLocationUpdate)(bookingId, finalLat, finalLng);
        (0, tracking_socket_1.sendVehicleLocationUpdate)(vehicleId, finalLat, finalLng);
        (0, tracking_socket_1.sendTripCompleted)(bookingId);
        return updated;
    }
    catch (err) {
        console.error("Error confirming delivery", err);
        throw err;
    }
};
exports.confirmDriverDelivery = confirmDriverDelivery;
const getBookingById = async (bookingId) => {
    try {
        const booking = await prisma_1.prisma.vehicleBooking.findUnique({
            where: { id: bookingId },
            include: {
                Customer: true,
                VehicleDetails: true
            }
        });
        if (!booking)
            throw new Error("BOOKING_NOT_FOUND");
        return booking;
    }
    catch (err) {
        console.error("Error fetching booking", err);
        throw err;
    }
};
exports.getBookingById = getBookingById;
const getAllBookings = async () => {
    try {
        const bookings = await prisma_1.prisma.vehicleBooking.findMany({
            orderBy: {
                createdAt: "desc"
            },
            include: {
                Customer: true,
                VehicleDetails: true
            }
        });
        return bookings;
    }
    catch (err) {
        console.error("Error fetching bookings", err);
        throw err;
    }
};
exports.getAllBookings = getAllBookings;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrackingLogs = exports.getCurrentLocation = exports.updateLocationService = void 0;
const prisma_1 = require("../../utils/prisma");
const geo_1 = require("../../utils/geo");
const tracking_socket_1 = require("../../sockets/tracking.socket");
const updateLocationService = async (data) => {
    try {
        const { bookingId, lat, lng } = data;
        const booking = await prisma_1.prisma.vehicleBooking.findUnique({
            where: { id: bookingId }
        });
        if (!booking)
            throw new Error("BOOKING_NOT_FOUND");
        if (booking.status === "COMPLETED") {
            return { message: "Booking already completed!" };
        }
        let shouldSave = true;
        // movement check
        if (booking.lastLat !== null && booking.lastLng !== null) {
            const moved = (0, geo_1.getDistance)(booking.lastLat, booking.lastLng, lat, lng);
            if (moved < 10) {
                shouldSave = false;
            }
        }
        if (!shouldSave) {
            return { message: "No significant movement" };
        }
        // save log
        await prisma_1.prisma.trackingLog.create({
            data: {
                bookingId,
                lat,
                lng
            }
        });
        // update booking current location
        await prisma_1.prisma.vehicleBooking.update({
            where: { id: bookingId },
            data: {
                lastLat: lat,
                lastLng: lng,
                lastUpdated: new Date(),
                status: booking.status === "LOADING" ? "LOADING" : "ONGOING"
            }
        });
        // 🔥 ADD THIS BLOCK (VERY IMPORTANT)
        await prisma_1.prisma.vehicleDetails.update({
            where: { id: booking.vehicleId },
            data: {
                lastLat: lat,
                lastLng: lng,
                lastUpdated: new Date()
            }
        });
        (0, tracking_socket_1.sendLocationUpdate)(booking.id, lat, lng);
        // 🔥 ALSO ADD THIS (for live map updates)
        (0, tracking_socket_1.sendVehicleLocationUpdate)(booking.vehicleId, lat, lng);
        // check destination
        const distToDest = (0, geo_1.getDistance)(lat, lng, booking.destLat, booking.destLng);
        if (distToDest < 10) {
            await prisma_1.prisma.$transaction(async (tx) => {
                await tx.vehicleBooking.update({
                    where: { id: bookingId },
                    data: { status: "COMPLETED" }
                });
                await tx.vehicleDetails.update({
                    where: { id: booking.vehicleId },
                    data: { status: "AVAILABLE" }
                });
            });
            return { message: "Trip completed!" };
        }
        return { message: "Location updated" };
    }
    catch (err) {
        console.error("Tracking error", err);
        throw err;
    }
};
exports.updateLocationService = updateLocationService;
const getCurrentLocation = async (bookingId) => {
    try {
        const booking = await prisma_1.prisma.vehicleBooking.findUnique({
            where: { id: bookingId }
        });
        if (!booking)
            throw new Error("BOOKING_NOT_FOUND");
        return {
            lat: booking.lastLat,
            lng: booking.lastLng,
            status: booking.status
        };
    }
    catch (err) {
        console.error("Get location error", err);
        throw err;
    }
};
exports.getCurrentLocation = getCurrentLocation;
const getTrackingLogs = async (bookingId) => {
    try {
        const logs = await prisma_1.prisma.trackingLog.findMany({
            where: { bookingId },
            orderBy: { createdAt: "asc" }
        });
        return logs;
    }
    catch (err) {
        console.error("Get logs error", err);
        throw err;
    }
};
exports.getTrackingLogs = getTrackingLogs;

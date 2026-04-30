"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVehicleAvailability = exports.updateVehicleLocation = exports.getNearbyVehicles = exports.deleteVehicle = exports.getVehicleById = exports.getAllVehicles = exports.updateVehicle = exports.createVehicle = void 0;
const geo_1 = require("../../utils/geo");
const prisma_1 = require("../../utils/prisma");
const tracking_socket_1 = require("../../sockets/tracking.socket");
const createVehicle = async (data) => {
    try {
        const { number, type, pricePerKm, ownerName, ownerMobile, ownerPassword } = data;
        const formattedNumber = number.replace(/\s+/g, "").toUpperCase();
        const existing = await prisma_1.prisma.vehicleDetails.findUnique({
            where: { number: formattedNumber }
        });
        if (existing) {
            throw new Error("VEHICLE_EXISTS");
        }
        // 🔥 Use transaction (important)
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // 1️⃣ Create vehicle
            const vehicle = await tx.vehicleDetails.create({
                data: {
                    number: formattedNumber,
                    type,
                    pricePerKm
                }
            });
            // 2️⃣ Create OWNER
            await tx.vehicleUser.create({
                data: {
                    name: ownerName,
                    mobileNumber: ownerMobile,
                    password: ownerPassword, // ⚠️ hash this in real app
                    type: "OWNER",
                    vehicleId: vehicle.id
                }
            });
            return vehicle;
        });
        return result;
    }
    catch (err) {
        console.error("Error creating vehicle", err);
        throw err;
    }
};
exports.createVehicle = createVehicle;
const updateVehicle = async (vehicleId, data) => {
    try {
        const existing = await prisma_1.prisma.vehicleDetails.findUnique({
            where: { id: vehicleId },
            include: { VehicleUser: true } // 🔥 include users
        });
        if (!existing) {
            throw new Error("VEHICLE_NOT_FOUND");
        }
        const { ownerName, ownerMobile, ...vehicleData } = data;
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // 1️⃣ Update vehicle
            const updatedVehicle = await tx.vehicleDetails.update({
                where: { id: vehicleId },
                data: vehicleData
            });
            // 2️⃣ Find OWNER
            const owner = existing.VehicleUser.find((u) => u.type === "OWNER");
            // 3️⃣ Update owner if exists
            if (owner && (ownerName || ownerMobile)) {
                await tx.vehicleUser.update({
                    where: { id: owner.id },
                    data: {
                        ...(ownerName && { name: ownerName }),
                        ...(ownerMobile && { mobileNumber: ownerMobile })
                    }
                });
            }
            // 4️⃣ If no owner exists (edge case) → create one
            if (!owner && ownerName) {
                await tx.vehicleUser.create({
                    data: {
                        name: ownerName,
                        mobileNumber: ownerMobile || "",
                        password: "123456", // ⚠️ temp
                        type: "OWNER",
                        vehicleId
                    }
                });
            }
            return updatedVehicle;
        });
        return result;
    }
    catch (err) {
        console.error("Error updating vehicle", err);
        throw err;
    }
};
exports.updateVehicle = updateVehicle;
const getAllVehicles = async () => {
    try {
        const vehicles = await prisma_1.prisma.vehicleDetails.findMany({
            where: { isActive: true },
            orderBy: { id: "desc" },
            include: {
                VehicleUser: true // 🔥 ADD THIS
            }
        });
        // 🔥 Extract owner for each vehicle
        return vehicles.map((vehicle) => {
            const owner = vehicle.VehicleUser.find((u) => u.type === "OWNER");
            return {
                ...vehicle,
                owner: (owner === null || owner === void 0 ? void 0 : owner.name) || null,
                ownerMobile: (owner === null || owner === void 0 ? void 0 : owner.mobileNumber) || null
            };
        });
    }
    catch (err) {
        console.error("Error fetching vehicles", err);
        throw err;
    }
};
exports.getAllVehicles = getAllVehicles;
const getVehicleById = async (vehicleId) => {
    try {
        const vehicle = await prisma_1.prisma.vehicleDetails.findUnique({
            where: { id: vehicleId },
            include: {
                VehicleUser: true // ✅ include all users
            }
        });
        if (!vehicle)
            throw new Error("VEHICLE_NOT_FOUND");
        // 🎯 Extract OWNER
        const owner = vehicle.VehicleUser.find(u => u.type === "OWNER");
        return {
            ...vehicle,
            owner: (owner === null || owner === void 0 ? void 0 : owner.name) || null // ✅ flatten for frontend
        };
    }
    catch (err) {
        console.error("Error fetching vehicle", err);
        throw err;
    }
};
exports.getVehicleById = getVehicleById;
const deleteVehicle = async (vehicleId) => {
    try {
        const existing = await prisma_1.prisma.vehicleDetails.findUnique({
            where: { id: vehicleId }
        });
        if (!existing) {
            throw new Error("VEHICLE_NOT_FOUND");
        }
        await prisma_1.prisma.vehicleDetails.update({
            where: { id: vehicleId },
            data: { isActive: false },
        });
        return { message: "Vehicle deleted successfully" };
    }
    catch (err) {
        console.error("Error deleting vehicle", err);
        throw err;
    }
};
exports.deleteVehicle = deleteVehicle;
const getNearbyVehicles = async (pickupLat, pickupLng) => {
    try {
        const vehicles = await prisma_1.prisma.vehicleDetails.findMany({
            where: {
                isActive: true,
                status: "AVAILABLE"
            },
            include: {
                VehicleUser: true
            }
        });
        const enriched = vehicles.map((v) => {
            var _a, _b, _c, _d;
            if (!v.lastLat || !v.lastLng)
                return null;
            const distance = (0, geo_1.getDistance)(pickupLat, pickupLng, v.lastLat, v.lastLng);
            const avgSpeed = 30; // km/h
            const eta = (distance / avgSpeed) * 60; // minutes
            return {
                ...v,
                owner: ((_b = (_a = v.VehicleUser) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.name) || "Unknown",
                ownerMobile: ((_d = (_c = v.VehicleUser) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.mobileNumber) || null,
                distance: Number(distance.toFixed(2)),
                eta: Math.round(eta),
                estimatedPrice: v.pricePerKm
                    ? Math.round(distance * v.pricePerKm)
                    : 0
            };
        });
        return enriched
            .filter((v) => v !== null)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 10);
    }
    catch (err) {
        console.error("Nearby vehicles error", err);
        throw err;
    }
};
exports.getNearbyVehicles = getNearbyVehicles;
const updateVehicleLocation = async (vehicleId, lat, lng) => {
    const vehicle = await prisma_1.prisma.vehicleDetails.update({
        where: { id: vehicleId },
        data: {
            lastLat: lat,
            lastLng: lng,
            lastUpdated: new Date()
        }
    });
    (0, tracking_socket_1.sendVehicleLocationUpdate)(vehicleId, lat, lng);
    return vehicle;
};
exports.updateVehicleLocation = updateVehicleLocation;
const updateVehicleAvailability = async (vehicleId, available, lat, lng) => {
    const vehicle = await prisma_1.prisma.vehicleDetails.update({
        where: { id: vehicleId },
        data: {
            status: available ? "AVAILABLE" : "BUSY",
            ...(lat !== undefined && lng !== undefined
                ? {
                    lastLat: lat,
                    lastLng: lng,
                    lastUpdated: new Date()
                }
                : {})
        }
    });
    if (lat !== undefined && lng !== undefined) {
        (0, tracking_socket_1.sendVehicleLocationUpdate)(vehicleId, lat, lng);
    }
    return vehicle;
};
exports.updateVehicleAvailability = updateVehicleAvailability;
const vehicleService = {
    createVehicle: exports.createVehicle,
    updateVehicle: exports.updateVehicle,
    getAllVehicles: exports.getAllVehicles,
    getVehicleById: exports.getVehicleById,
    deleteVehicle: exports.deleteVehicle,
    getNearbyVehicles: exports.getNearbyVehicles,
    updateVehicleLocation: exports.updateVehicleLocation,
    updateVehicleAvailability: exports.updateVehicleAvailability
};
exports.default = vehicleService;

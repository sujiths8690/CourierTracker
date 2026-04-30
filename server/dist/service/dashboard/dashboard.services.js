"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardData = void 0;
const prisma_1 = require("../../utils/prisma");
const getDashboardData = async () => {
    try {
        // 🔹 TOTAL COUNTS
        const totalVehicles = await prisma_1.prisma.vehicleDetails.count({
            where: { isActive: true }
        });
        const totalCustomers = await prisma_1.prisma.customer.count({
            where: { isActive: true }
        });
        const totalBookings = await prisma_1.prisma.vehicleBooking.count({
            where: { isActive: true }
        });
        // 🔹 STATUS COUNTS
        const ongoingBookings = await prisma_1.prisma.vehicleBooking.count({
            where: { status: "ONGOING" }
        });
        const completedBookings = await prisma_1.prisma.vehicleBooking.count({
            where: { status: "COMPLETED" }
        });
        const pendingBookings = await prisma_1.prisma.vehicleBooking.count({
            where: { status: "PENDING" }
        });
        const availableVehicles = await prisma_1.prisma.vehicleDetails.count({
            where: { status: "AVAILABLE" }
        });
        const availableVehicleDetails = await prisma_1.prisma.vehicleDetails.findMany({
            where: {
                status: "AVAILABLE"
            }
        });
        const busyVehicles = await prisma_1.prisma.vehicleDetails.count({
            where: { status: "BUSY" }
        });
        // 🔹 DASHBOARD BOOKINGS
        // Show live orders first; if none are running, show the last 3 completed orders.
        const liveBookings = await prisma_1.prisma.vehicleBooking.findMany({
            where: {
                status: {
                    in: ["PENDING", "LOADING", "ONGOING"]
                },
                isActive: true
            },
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                Customer: true,
                VehicleDetails: true
            }
        });
        const recentBookings = liveBookings.length > 0
            ? liveBookings
            : await prisma_1.prisma.vehicleBooking.findMany({
                where: {
                    status: "COMPLETED"
                },
                take: 3,
                orderBy: { updatedAt: "desc" },
                include: {
                    Customer: true,
                    VehicleDetails: true
                }
            });
        // 🔹 ACTIVE TRIPS (map / live view)
        const activeTrips = await prisma_1.prisma.vehicleBooking.findMany({
            where: {
                status: "ONGOING"
            },
            select: {
                id: true,
                trackingToken: true,
                lastLat: true,
                lastLng: true,
                pickupAddress: true,
                destAddress: true,
                VehicleDetails: {
                    select: {
                        number: true
                    }
                }
            }
        });
        return {
            // 🔥 EXACT UI FORMAT
            totalOrders: totalBookings,
            inTransit: ongoingBookings,
            delivered: completedBookings,
            customers: totalCustomers,
            // keep these as is
            recentBookings,
            // 🔥 ACTIVE VEHICLES (convert from activeTrips)
            activeVehicles: availableVehicleDetails,
            // 🔥 RECENT CUSTOMERS (ADD THIS)
            recentCustomers: await prisma_1.prisma.customer.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    address: true
                }
            })
        };
    }
    catch (err) {
        console.error("Dashboard error:", err);
        throw err;
    }
};
exports.getDashboardData = getDashboardData;

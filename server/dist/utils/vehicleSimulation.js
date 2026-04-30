"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startVehicleSimulation = void 0;
const vehicle_services_1 = require("../service/vehicle/vehicle.services");
const tracking_socket_1 = require("../sockets/tracking.socket");
const prisma_1 = require("../utils/prisma");
const geo_1 = require("./geo");
const routeCache = {};
const routeIndex = {};
const loadingStartTime = {};
// ✅ LOCKS
const pickupReachedMap = {};
const destinationReachedMap = {};
const completeBookingAtDestination = async (booking) => {
    await prisma_1.prisma.$transaction(async (tx) => {
        await tx.vehicleBooking.update({
            where: { id: booking.id },
            data: {
                status: "COMPLETED",
                isActive: false,
                lastLat: booking.destLat,
                lastLng: booking.destLng,
                lastUpdated: new Date()
            },
        });
        await tx.vehicleDetails.update({
            where: { id: booking.vehicleId },
            data: {
                status: "AVAILABLE",
                lastLat: booking.destLat,
                lastLng: booking.destLng,
                lastUpdated: new Date()
            },
        });
        await tx.trackingLog.create({
            data: {
                bookingId: booking.id,
                lat: booking.destLat,
                lng: booking.destLng,
            },
        });
    });
    (0, tracking_socket_1.sendLocationUpdate)(booking.id, booking.destLat, booking.destLng);
    (0, tracking_socket_1.sendVehicleLocationUpdate)(booking.vehicleId, booking.destLat, booking.destLng);
    (0, tracking_socket_1.sendTripCompleted)(booking.id);
};
const getRoute = async (start, end) => {
    try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`);
        const data = await res.json();
        return data.routes[0].geometry.coordinates;
    }
    catch {
        return [];
    }
};
const startVehicleSimulation = async () => {
    console.log("🚚 Vehicle simulation started...");
    setInterval(async () => {
        var _a, _b;
        const vehicles = await prisma_1.prisma.vehicleDetails.findMany({
            where: { isActive: true },
        });
        for (const v of vehicles) {
            let currentLat = (_a = v.lastLat) !== null && _a !== void 0 ? _a : 9.9312;
            let currentLng = (_b = v.lastLng) !== null && _b !== void 0 ? _b : 76.2673;
            const booking = await prisma_1.prisma.vehicleBooking.findFirst({
                where: {
                    vehicleId: v.id,
                    status: { in: ["PENDING", "ONGOING", "LOADING"] },
                    isActive: true,
                },
            });
            // =========================================================
            // 🚚 VEHICLE WITH BOOKING
            // =========================================================
            if (booking) {
                const cacheKey = `${v.id}-${booking.id}`;
                // ✅ DESTINATION CHECK (STOP LOOP)
                const reachedDestination = (0, geo_1.getDistance)(currentLat, currentLng, booking.destLat, booking.destLng) < 0.05;
                if (pickupReachedMap[cacheKey] === true && reachedDestination) {
                    if (!destinationReachedMap[cacheKey]) {
                        destinationReachedMap[cacheKey] = true;
                        console.log("📦 FINAL DESTINATION REACHED");
                        await completeBookingAtDestination(booking);
                    }
                    continue; // 🚫 STOP MOVEMENT
                }
                // ✅ PICKUP CHECK
                const reachedPickup = (0, geo_1.getDistance)(currentLat, currentLng, booking.pickupLat, booking.pickupLng) < 0.05;
                if (!pickupReachedMap[cacheKey] && reachedPickup) {
                    pickupReachedMap[cacheKey] = true;
                    loadingStartTime[cacheKey] = Date.now();
                    await prisma_1.prisma.vehicleBooking.update({
                        where: { id: booking.id },
                        data: { status: "LOADING" }, // 👈 NEW STATUS
                    });
                    console.log("📦 Pickup reached → loading items into truck");
                    delete routeCache[cacheKey];
                    delete routeIndex[cacheKey];
                    continue;
                }
                // 🕒 LOADING STATE (WAIT 5 seconds)
                if (pickupReachedMap[cacheKey] && !destinationReachedMap[cacheKey]) {
                    const startTime = loadingStartTime[cacheKey];
                    if (startTime && Date.now() - startTime < 5000) {
                        console.log("⏳ Loading... please wait");
                        continue;
                    }
                    // ✅ LOADING DONE → START DELIVERY
                    if (startTime) {
                        console.log("🚚 Loading complete → moving to destination");
                        await prisma_1.prisma.vehicleBooking.update({
                            where: { id: booking.id },
                            data: { status: "ONGOING" },
                        });
                        delete loadingStartTime[cacheKey];
                    }
                }
                // ✅ CREATE ROUTE
                if (!routeCache[cacheKey]) {
                    const start = { lat: currentLat, lng: currentLng };
                    const end = !pickupReachedMap[cacheKey]
                        ? { lat: booking.pickupLat, lng: booking.pickupLng }
                        : { lat: booking.destLat, lng: booking.destLng };
                    // 🚨 AVOID MICRO ROUTES
                    const distanceToTarget = (0, geo_1.getDistance)(currentLat, currentLng, end.lat, end.lng);
                    if (distanceToTarget < 0.03) {
                        // SAME LOGIC HERE
                        if (!pickupReachedMap[cacheKey]) {
                            console.log("📦 Close enough → FORCE pickup reached");
                            pickupReachedMap[cacheKey] = true;
                            loadingStartTime[cacheKey] = Date.now();
                            await prisma_1.prisma.vehicleBooking.update({
                                where: { id: booking.id },
                                data: { status: "LOADING" },
                            });
                            delete routeCache[cacheKey];
                            delete routeIndex[cacheKey];
                            continue;
                        }
                        else {
                            if (!pickupReachedMap[cacheKey]) {
                                console.log("⚠️ Ignoring destination force — pickup not reached yet");
                                continue;
                            }
                            console.log("📦 Close enough → FORCE destination reached");
                            destinationReachedMap[cacheKey] = true;
                            await completeBookingAtDestination(booking);
                            continue;
                        }
                    }
                    const newRoute = await getRoute(start, end);
                    // 🚨 BLOCK SMALL ROUTES (MAIN FIX)
                    if (!newRoute.length || newRoute.length < 2) {
                        // ✅ IF GOING TO PICKUP → FORCE PICKUP REACHED
                        if (!pickupReachedMap[cacheKey]) {
                            console.log("📦 Route too small → FORCE pickup reached");
                            pickupReachedMap[cacheKey] = true;
                            loadingStartTime[cacheKey] = Date.now();
                            await prisma_1.prisma.vehicleBooking.update({
                                where: { id: booking.id },
                                data: { status: "LOADING" },
                            });
                            delete routeCache[cacheKey];
                            delete routeIndex[cacheKey];
                            continue;
                        }
                        // ✅ IF GOING TO DESTINATION → FORCE DELIVERY
                        else {
                            // 🚫 DO NOT COMPLETE BEFORE PICKUP
                            if (!pickupReachedMap[cacheKey]) {
                                console.log("⚠️ Ignoring destination force — pickup not reached yet");
                                continue;
                            }
                            console.log("📦 Route too small → FORCE destination reached");
                            destinationReachedMap[cacheKey] = true;
                            await completeBookingAtDestination(booking);
                            continue;
                        }
                    }
                    routeCache[cacheKey] = newRoute;
                    routeIndex[cacheKey] = 0;
                }
                const route = routeCache[cacheKey];
                const index = routeIndex[cacheKey] || 0;
                if (!route[index]) {
                    console.log("⚠️ Route ended → waiting for new route");
                    delete routeCache[cacheKey];
                    delete routeIndex[cacheKey];
                    // ❗ DO NOT continue blindly → force route recreation next loop
                    continue;
                }
                const [lng, lat] = route[index];
                // ✅ UPDATE VEHICLE
                await (0, vehicle_services_1.updateVehicleLocation)(v.id, lat, lng);
                // ✅ SAVE TRACKING
                await prisma_1.prisma.trackingLog.create({
                    data: {
                        bookingId: booking.id,
                        lat,
                        lng,
                    },
                });
                // ✅ SOCKET
                (0, tracking_socket_1.sendLocationUpdate)(booking.id, lat, lng);
                (0, tracking_socket_1.sendVehicleLocationUpdate)(v.id, lat, lng);
                // 👉 MOVE FORWARD
                routeIndex[cacheKey] = index + 1;
                // ✅ ROUTE COMPLETE
                if (routeIndex[cacheKey] >= route.length) {
                    console.log("✅ Route completed");
                    // 🔥 CRITICAL: decide stage here
                    if (!pickupReachedMap[cacheKey]) {
                        console.log("📦 Route finished → treating as PICKUP reached");
                        pickupReachedMap[cacheKey] = true;
                        loadingStartTime[cacheKey] = Date.now();
                        await prisma_1.prisma.vehicleBooking.update({
                            where: { id: booking.id },
                            data: { status: "LOADING" },
                        });
                    }
                    else if (!destinationReachedMap[cacheKey]) {
                        console.log("📦 Route finished → treating as DESTINATION reached");
                        destinationReachedMap[cacheKey] = true;
                        await completeBookingAtDestination(booking);
                    }
                    delete routeCache[cacheKey];
                    delete routeIndex[cacheKey];
                }
            }
            // =========================================================
            // 🌍 NO BOOKING → RANDOM MOVEMENT
            // =========================================================
            else {
                if (!routeCache[v.id]) {
                    const start = { lat: currentLat, lng: currentLng };
                    const end = {
                        lat: currentLat + (Math.random() - 0.5) * 0.02,
                        lng: currentLng + (Math.random() - 0.5) * 0.02,
                    };
                    const newRoute = await getRoute(start, end);
                    if (!newRoute.length || newRoute.length < 2) {
                        console.log("⚠️ Small route → direct move");
                        const step = 0.0005;
                        const lat = currentLat + (end.lat - currentLat) * step;
                        const lng = currentLng + (end.lng - currentLng) * step;
                        await (0, vehicle_services_1.updateVehicleLocation)(v.id, lat, lng);
                        (0, tracking_socket_1.sendVehicleLocationUpdate)(v.id, lat, lng);
                        continue;
                    }
                    routeCache[v.id] = newRoute;
                    routeIndex[v.id] = 0;
                }
                const route = routeCache[v.id];
                const index = routeIndex[v.id] || 0;
                if (!route[index]) {
                    delete routeCache[v.id];
                    delete routeIndex[v.id];
                    continue;
                }
                const [lng, lat] = route[index];
                await (0, vehicle_services_1.updateVehicleLocation)(v.id, lat, lng);
                (0, tracking_socket_1.sendVehicleLocationUpdate)(v.id, lat, lng);
                routeIndex[v.id] = index + 1;
                if (routeIndex[v.id] >= route.length) {
                    delete routeCache[v.id];
                    delete routeIndex[v.id];
                }
            }
        }
    }, 3000);
};
exports.startVehicleSimulation = startVehicleSimulation;

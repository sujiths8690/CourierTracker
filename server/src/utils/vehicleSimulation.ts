import { updateVehicleLocation } from "../service/vehicle/vehicle.services";
import { sendLocationUpdate, sendVehicleLocationUpdate } from "../sockets/tracking.socket";
import { prisma } from "../utils/prisma";
import { getDistance } from "./geo";

const routeCache: Record<string, any[]> = {};
const routeIndex: Record<string, number> = {};
const loadingStartTime: Record<string, number> = {};

// ✅ LOCKS
const pickupReachedMap: Record<string, boolean> = {};
const destinationReachedMap: Record<string, boolean> = {};

const getRoute = async (start: any, end: any) => {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
    );

    const data = await res.json();
    return data.routes[0].geometry.coordinates;
  } catch {
    return [];
  }
};

export const startVehicleSimulation = async () => {
  console.log("🚚 Vehicle simulation started...");

  setInterval(async () => {
    const vehicles = await prisma.vehicleDetails.findMany({
      where: { isActive: true },
    });

    for (const v of vehicles) {
      let currentLat = v.lastLat ?? 9.9312;
      let currentLng = v.lastLng ?? 76.2673;

      const booking = await prisma.vehicleBooking.findFirst({
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
        const reachedDestination =
          getDistance(
            currentLat,
            currentLng,
            booking.destLat,
            booking.destLng
          ) < 0.05;

        if (pickupReachedMap[cacheKey] === true && reachedDestination) {
          if (!destinationReachedMap[cacheKey]) {
            destinationReachedMap[cacheKey] = true;

            console.log("📦 FINAL DESTINATION REACHED");

            await prisma.vehicleBooking.update({
              where: { id: booking.id },
              data: { status: "COMPLETED", isActive: false },
            });
          }

          continue; // 🚫 STOP MOVEMENT
        }

        // ✅ PICKUP CHECK
        const reachedPickup =
          getDistance(
            currentLat,
            currentLng,
            booking.pickupLat,
            booking.pickupLng
          ) < 0.05;

        if (!pickupReachedMap[cacheKey] && reachedPickup) {
          pickupReachedMap[cacheKey] = true;

          loadingStartTime[cacheKey] = Date.now();

          await prisma.vehicleBooking.update({
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

            await prisma.vehicleBooking.update({
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
          const distanceToTarget = getDistance(
            currentLat,
            currentLng,
            end.lat,
            end.lng
          );

          if (distanceToTarget < 0.03) {

            // SAME LOGIC HERE
            if (!pickupReachedMap[cacheKey]) {
              console.log("📦 Close enough → FORCE pickup reached");

              pickupReachedMap[cacheKey] = true;
              loadingStartTime[cacheKey] = Date.now();

              await prisma.vehicleBooking.update({
                where: { id: booking.id },
                data: { status: "LOADING" },
              });

              delete routeCache[cacheKey];
              delete routeIndex[cacheKey];

              continue;
            } else {
              if (!pickupReachedMap[cacheKey]) {
                console.log("⚠️ Ignoring destination force — pickup not reached yet");
                continue;
              }

              console.log("📦 Close enough → FORCE destination reached");

              destinationReachedMap[cacheKey] = true;

              await prisma.vehicleBooking.update({
                where: { id: booking.id },
                data: { status: "COMPLETED", isActive: false },
              });

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

              await prisma.vehicleBooking.update({
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

              await prisma.vehicleBooking.update({
                where: { id: booking.id },
                data: { status: "COMPLETED", isActive: false },
              });

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
        await updateVehicleLocation(v.id, lat, lng);

        // ✅ SAVE TRACKING
        await prisma.trackingLog.create({
          data: {
            bookingId: booking.id,
            lat,
            lng,
          },
        });

        // ✅ SOCKET
        sendLocationUpdate(booking.id, lat, lng);
        sendVehicleLocationUpdate(v.id, lat, lng);

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

            await prisma.vehicleBooking.update({
              where: { id: booking.id },
              data: { status: "LOADING" },
            });
          } else if (!destinationReachedMap[cacheKey]) {
            console.log("📦 Route finished → treating as DESTINATION reached");

            destinationReachedMap[cacheKey] = true;

            await prisma.vehicleBooking.update({
              where: { id: booking.id },
              data: { status: "COMPLETED", isActive: false },
            });
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

            await updateVehicleLocation(v.id, lat, lng);
            sendVehicleLocationUpdate(v.id, lat, lng);

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

        await updateVehicleLocation(v.id, lat, lng);
        sendVehicleLocationUpdate(v.id, lat, lng);

        routeIndex[v.id] = index + 1;

        if (routeIndex[v.id] >= route.length) {
          delete routeCache[v.id];
          delete routeIndex[v.id];
        }
      }
    }
  }, 3000);
};
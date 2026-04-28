import { prisma } from "./prisma";
import { sendVehicleLocationUpdate } from "../sockets/tracking.socket";

let interval: NodeJS.Timeout;

// 🧠 Store routes in memory
const vehicleRoutes: Record<number, [number, number][]> = {};
const vehicleIndexes: Record<number, number> = {};

// 🧠 Booking-based simulation storage
const bookingRoutes: Record<number, [number, number][]> = {};
const bookingIndexes: Record<number, number> = {};

interface BookingSimulationInput {
  id: number;
  vehicleId: number;
  pickupLat: number;
  pickupLng: number;
  destLat: number;
  destLng: number;
}

// 🌍 Get route from OSRM
const getRoute = async (
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
) => {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
    );

    const data = await res.json();

    return data.routes[0].geometry.coordinates; // [lng, lat]
  } catch (err) {
    console.error("Route fetch failed", err);
    return [];
  }
};

export const startVehicleSimulation = () => {
  console.log("🚀 Vehicle simulation started");

  interval = setInterval(async () => {
    try {
      const vehicles = await prisma.vehicleDetails.findMany({
        where: {
          isActive: true,
          status: "AVAILABLE"
        }
      });

      for (const v of vehicles) {

        let baseLat = v.lastLat;
        let baseLng = v.lastLng;

        // 🟢 If no location → assign initial location
        if (baseLat == null || baseLng == null) {
          baseLat = 9.9312 + (Math.random() - 0.5) * 0.01;
          baseLng = 76.2673 + (Math.random() - 0.5) * 0.01;

          await prisma.vehicleDetails.update({
            where: { id: v.id },
            data: {
              lastLat: baseLat,
              lastLng: baseLng
            }
          });
        }

        // 🔥 If no route → create one
        if (!vehicleRoutes[v.id]) {
          const endLat = baseLat + (Math.random() - 0.5) * 0.05;
          const endLng = baseLng + (Math.random() - 0.5) * 0.05;

          const route = await getRoute(baseLat, baseLng, endLat, endLng);

          if (!route.length) continue;

          vehicleRoutes[v.id] = route;
          vehicleIndexes[v.id] = 0;
        }

        const route = vehicleRoutes[v.id];
        let index = vehicleIndexes[v.id];

        // 🔁 If route finished → reset
        if (index >= route.length) {
          delete vehicleRoutes[v.id];
          delete vehicleIndexes[v.id];
          continue;
        }

        // 🚗 Move along route
        const [lng, lat] = route[index];

        vehicleIndexes[v.id] = index + 1;

        const newLat = lat;
        const newLng = lng;

        // 💾 Save to DB
        await prisma.vehicleDetails.update({
          where: { id: v.id },
          data: {
            lastLat: newLat,
            lastLng: newLng
          }
        });

        // 📡 Send via WebSocket
        sendVehicleLocationUpdate(v.id, newLat, newLng);
      }

      // 🔴 HANDLE BOOKING VEHICLES (VERY IMPORTANT)
      const activeBookings = await prisma.vehicleBooking.findMany({
        where: {
          status: "ONGOING"
        }
      });

      for (const b of activeBookings) {

        const route = bookingRoutes[b.id];
        let index = bookingIndexes[b.id];

        if (!route) continue;

        if (index >= route.length) {
          delete bookingRoutes[b.id];
          delete bookingIndexes[b.id];

          await prisma.vehicleBooking.update({
            where: { id: b.id },
            data: { status: "COMPLETED" }
          });

          console.log("✅ Booking completed:", b.id);
          continue;
        }

        const [lng, lat] = route[index];

        bookingIndexes[b.id] = index + 1;

        // 🚗 Update vehicle location
        await prisma.vehicleDetails.update({
          where: { id: b.vehicleId },
          data: {
            lastLat: lat,
            lastLng: lng
          }
        });

        // 📡 Send via WebSocket (IMPORTANT: bookingId)
        sendVehicleLocationUpdate(b.id, lat, lng);
      }

    } catch (err) {
      console.error("Simulation error:", err);
    }
  }, 2000); // 🔥 smoother movement (2 sec)
};

export const stopVehicleSimulation = () => {
  clearInterval(interval);
};

const snapToRoad = async (lat: number, lng: number) => {
  const res = await fetch(
    `https://router.project-osrm.org/nearest/v1/driving/${lng},${lat}`
  );

  const data = await res.json();

  return [
    data.waypoints[0].location[1], // lat
    data.waypoints[0].location[0]  // lng
  ];
};

export const startBookingSimulation = async (booking: BookingSimulationInput) => {
  const vehicle = await prisma.vehicleDetails.findUnique({
    where: { id: booking.vehicleId }
  });

  if (!vehicle) return;

  let startLat = vehicle.lastLat;
  let startLng = vehicle.lastLng;

  if (startLat == null || startLng == null) {
    startLat = booking.pickupLat;
    startLng = booking.pickupLng;
  }

    // 🔥 SNAP POINTS TO REAL ROAD
  const [snapPickupLat, snapPickupLng] = await snapToRoad(
    booking.pickupLat,
    booking.pickupLng
  );

  const [snapDestLat, snapDestLng] = await snapToRoad(
    booking.destLat,
    booking.destLng
  );

  // 🚗 vehicle → pickup (snap pickup)
  const route1 = await getRoute(
    startLat,
    startLng,
    snapPickupLat,
    snapPickupLng
  );

  // 📦 pickup → destination (snap both)
  const route2 = await getRoute(
    snapPickupLat,
    snapPickupLng,
    snapDestLat,
    snapDestLng
  );
  const fullRoute: [number, number][] = [...route1, ...route2].map(
    ([lng, lat]: [number, number]) => [lat, lng]
  );

  if (!fullRoute.length) return;

  // 🔥 ADD HERE
  await prisma.vehicleBooking.update({
    where: { id: booking.id },
    data: {
      route: fullRoute
    }
  });

  bookingRoutes[booking.id] = fullRoute;
  bookingIndexes[booking.id] = 0;

  console.log("🔥 Booking simulation started:", booking.id);
};
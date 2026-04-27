import { prisma } from "./prisma";
import { sendVehicleLocationUpdate } from "../sockets/tracking.socket";

let interval: NodeJS.Timeout;

// 🧠 Store routes in memory
const vehicleRoutes: Record<number, [number, number][]> = {};
const vehicleIndexes: Record<number, number> = {};

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

    } catch (err) {
      console.error("Simulation error:", err);
    }
  }, 2000); // 🔥 smoother movement (2 sec)
};

export const stopVehicleSimulation = () => {
  clearInterval(interval);
};
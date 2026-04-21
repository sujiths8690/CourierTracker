import axios from "axios";

export const getDistanceAndTime = async (
  pickup: { lat: number; lng: number },
  dest: { lat: number; lng: number }
) => {
  try {
    const url = `http://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dest.lng},${dest.lat}?overview=false`;

    const res = await axios.get(url);

    const route = res.data.routes[0];

    const distanceKm = route.distance / 1000; // meters → km
    const etaMinutes = route.duration / 60;   // seconds → minutes

    return {
      distanceKm,
      etaMinutes
    };

  } catch (error) {
    console.error("Distance API error", error);
    throw new Error("DISTANCE_CALCULATION_FAILED");
  }
};
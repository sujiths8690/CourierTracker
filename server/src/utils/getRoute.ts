import axios from "axios";

export const getRoute = async (
  pickupLat: number,
  pickupLng: number,
  destLat: number,
  destLng: number
) => {
  try {
    const res = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        coordinates: [
          [pickupLng, pickupLat],
          [destLng, destLat]
        ]
      },
      {
        headers: {
          Authorization: process.env.ORS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const data = res.data;

    // 🔥 SAFETY CHECK
    if (!data.features || data.features.length === 0) {
      console.error("❌ ORS RESPONSE:", data);
      throw new Error("ROUTE_NOT_FOUND");
    }

    return data.features[0].geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng]
    );

  } catch (err: any) {
    console.error("❌ ROUTE ERROR:", err.response?.data || err.message);

    throw new Error("ROUTE_NOT_FOUND");
  }
};
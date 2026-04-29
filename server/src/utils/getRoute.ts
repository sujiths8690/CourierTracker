import axios from "axios";

function decodePolyline(str: string, precision = 5) {
  let index = 0, lat = 0, lng = 0, coordinates = [];
  const factor = Math.pow(10, precision);

  while (index < str.length) {
    let b, shift = 0, result = 0;

    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    coordinates.push([lat / factor, lng / factor]);
  }

  return coordinates;
}

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
    if (!data.routes || data.routes.length === 0) {
      console.error("❌ ORS RESPONSE:", data);
      throw new Error("ROUTE_NOT_FOUND");
    }

    // 🔥 decode polyline geometry
    const encoded = data.routes[0].geometry;

    const decoded = decodePolyline(encoded);

    return decoded;

  } catch (err: any) {
    console.error("❌ ROUTE ERROR:", err.response?.data || err.message);

    throw new Error("ROUTE_NOT_FOUND");
  }
};
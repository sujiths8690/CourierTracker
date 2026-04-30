import { getDistanceKm } from "./distance";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const normalizeRoute = (route) => {
  if (!Array.isArray(route)) return [];

  return route
    .filter((point) => Array.isArray(point) && point.length >= 2)
    .map(([a, b]) => [Number(a), Number(b)])
    .filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
};

const getRouteProgress = (route, position) => {
  const safeRoute = normalizeRoute(route);

  if (safeRoute.length < 2 || !position) return null;

  let closestIndex = 0;
  let closestDistance = Infinity;

  safeRoute.forEach(([lat, lng], index) => {
    const distance = getDistanceKm(position.lat, position.lng, lat, lng);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex / (safeRoute.length - 1);
};

const getBookingPosition = (booking) => {
  const lat = booking.lastLat ?? booking.VehicleDetails?.lastLat;
  const lng = booking.lastLng ?? booking.VehicleDetails?.lastLng;

  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
    return null;
  }

  return {
    lat: Number(lat),
    lng: Number(lng)
  };
};

export const getBookingProgress = (booking) => {
  if (!booking) return 0;

  const status = (booking.status || "").toUpperCase();

  if (status === "COMPLETED") return 100;
  if (status === "CANCELLED") return 0;
  if (status === "LOADING") return 33;

  if (status === "ONGOING") {
    const routeProgress = getRouteProgress(booking.route, getBookingPosition(booking));

    if (routeProgress == null) return 66;

    return Math.round(clamp(33 + routeProgress * 67, 34, 99));
  }

  return 0;
};

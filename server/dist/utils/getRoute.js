"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoute = void 0;
const axios_1 = __importDefault(require("axios"));
function decodePolyline(str, precision = 5) {
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
const getRoute = async (pickupLat, pickupLng, destLat, destLng) => {
    var _a;
    try {
        const res = await axios_1.default.post("https://api.openrouteservice.org/v2/directions/driving-car", {
            coordinates: [
                [pickupLng, pickupLat],
                [destLng, destLat]
            ]
        }, {
            headers: {
                Authorization: process.env.ORS_API_KEY,
                "Content-Type": "application/json"
            }
        });
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
    }
    catch (err) {
        console.error("❌ ROUTE ERROR:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
        throw new Error("ROUTE_NOT_FOUND");
    }
};
exports.getRoute = getRoute;

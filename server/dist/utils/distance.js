"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistanceAndTime = void 0;
const axios_1 = __importDefault(require("axios"));
const getDistanceAndTime = async (pickup, dest) => {
    try {
        const url = `http://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dest.lng},${dest.lat}?overview=false`;
        const res = await axios_1.default.get(url);
        const route = res.data.routes[0];
        const distanceKm = route.distance / 1000; // meters → km
        const etaMinutes = route.duration / 60; // seconds → minutes
        return {
            distanceKm,
            etaMinutes
        };
    }
    catch (error) {
        console.error("Distance API error", error);
        throw new Error("DISTANCE_CALCULATION_FAILED");
    }
};
exports.getDistanceAndTime = getDistanceAndTime;

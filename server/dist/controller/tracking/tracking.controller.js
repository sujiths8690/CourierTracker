"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrackingLogsController = exports.getCurrentLocation = exports.updateLocation = void 0;
const trackingService = __importStar(require("../../service/tracking/tracking.services"));
const updateLocation = async (req, res) => {
    try {
        const bookingId = Number(req.params.id);
        const { lat, lng } = req.body;
        if (isNaN(bookingId)) {
            return res.status(400).json({
                message: "Invalid booking ID"
            });
        }
        if (lat === undefined || lng === undefined) {
            return res.status(400).json({
                message: "Invalid coordinates"
            });
        }
        const result = await trackingService.updateLocationService({
            bookingId,
            lat,
            lng
        });
        res.json(result);
    }
    catch (err) {
        if (err.message === "BOOKING_NOT_FOUND") {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.status(500).json({ message: err.message });
    }
};
exports.updateLocation = updateLocation;
const getCurrentLocation = async (req, res) => {
    try {
        const bookingId = Number(req.params.id);
        const result = await trackingService.getCurrentLocation(bookingId);
        res.json(result);
    }
    catch (err) {
        if (err.message === "BOOKING_NOT_FOUND") {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.status(500).json({ message: err.message });
    }
};
exports.getCurrentLocation = getCurrentLocation;
const getTrackingLogsController = async (req, res) => {
    try {
        const bookingId = Number(req.params.bookingId);
        const logs = await trackingService.getTrackingLogs(bookingId);
        res.json({
            message: "Logs fetched",
            data: logs
        });
    }
    catch (err) {
        res.status(500).json({ message: "Failed to fetch logs" });
    }
};
exports.getTrackingLogsController = getTrackingLogsController;

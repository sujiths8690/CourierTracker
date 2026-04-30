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
exports.getAllBookingsController = exports.getBookingById = exports.updateBooking = exports.createBooking = void 0;
const bookingService = __importStar(require("../../service/booking/booking.services"));
const createBooking = async (req, res) => {
    try {
        console.log("USER:", req.user);
        const result = await bookingService.createBooking({
            ...req.body,
            userId: req.user.userId
        });
        res.status(201).json({
            message: "Booking created successfully",
            ...result,
            trackingLink: `/track/${result.booking.trackingToken}`
        });
    }
    catch (err) {
        if (err.message === "CUSTOMER_NOT_FOUND") {
            return res.status(404).json({ message: "Customer not found" });
        }
        if (err.message === "VEHICLE_BUSY") {
            return res.status(409).json({ message: "Vehicle not available" });
        }
        if (err.message === "VEHICLE_NOT_FOUND") {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        res.status(500).json({ message: err.message });
    }
};
exports.createBooking = createBooking;
const updateBooking = async (req, res) => {
    try {
        const bookingId = Number(req.params.id);
        const result = await bookingService.updateBooking(bookingId, req.body);
        res.json({
            message: "Booking updated successfully",
            ...result
        });
    }
    catch (err) {
        if (err.message === "BOOKING_NOT_FOUND") {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.status(500).json({ message: err.message });
    }
};
exports.updateBooking = updateBooking;
const getBookingById = async (req, res) => {
    try {
        const bookingId = Number(req.params.id);
        const result = await bookingService.getBookingById(bookingId);
        res.json({
            message: "Booking fetched successfully",
            data: result
        });
    }
    catch (err) {
        if (err.message === "BOOKING_NOT_FOUND") {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.status(500).json({ message: err.message });
    }
};
exports.getBookingById = getBookingById;
const getAllBookingsController = async (req, res) => {
    try {
        const bookings = await bookingService.getAllBookings();
        res.status(200).json({
            message: "Bookings fetched successfully",
            data: bookings
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Failed to fetch bookings"
        });
    }
};
exports.getAllBookingsController = getAllBookingsController;

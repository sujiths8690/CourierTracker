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
const express_1 = require("express");
const bookingController = __importStar(require("../../controller/booking/booking.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/create", auth_middleware_1.authenticate, bookingController.createBooking);
router.put("/update/:id", auth_middleware_1.authenticate, bookingController.updateBooking);
router.get("/driver/requests", auth_middleware_1.authenticate, bookingController.getDriverBookingsController);
router.get("/driver/history", auth_middleware_1.authenticate, bookingController.getDriverBookingHistoryController);
router.patch("/driver/requests/:id/accept", auth_middleware_1.authenticate, bookingController.acceptDriverBookingController);
router.patch("/driver/requests/:id/reject", auth_middleware_1.authenticate, bookingController.rejectDriverBookingController);
router.patch("/driver/requests/:id/pickup", auth_middleware_1.authenticate, bookingController.confirmDriverPickupController);
router.patch("/driver/requests/:id/delivered", auth_middleware_1.authenticate, bookingController.confirmDriverDeliveryController);
router.get("/:id", auth_middleware_1.authenticate, bookingController.getBookingById);
router.get("/", bookingController.getAllBookingsController);
exports.default = router;

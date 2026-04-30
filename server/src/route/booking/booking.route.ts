import { Router } from "express";
import * as bookingController from "../../controller/booking/booking.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.post("/create", authenticate, bookingController.createBooking);
router.put("/update/:id", authenticate, bookingController.updateBooking);
router.get("/driver/requests", authenticate, bookingController.getDriverBookingsController);
router.get("/driver/history", authenticate, bookingController.getDriverBookingHistoryController);
router.patch("/driver/requests/:id/accept", authenticate, bookingController.acceptDriverBookingController);
router.patch("/driver/requests/:id/reject", authenticate, bookingController.rejectDriverBookingController);
router.patch("/driver/requests/:id/pickup", authenticate, bookingController.confirmDriverPickupController);
router.patch("/driver/requests/:id/delivered", authenticate, bookingController.confirmDriverDeliveryController);
router.get("/:id", authenticate, bookingController.getBookingById);
router.get("/", bookingController.getAllBookingsController);

export default router;

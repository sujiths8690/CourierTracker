import { Router } from "express";
import * as bookingController from "../../controller/booking/booking.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.post("/create", authenticate, bookingController.createBooking);
router.put("/update/:id", authenticate, bookingController.updateBooking);
router.get("/:id", authenticate, bookingController.getBooking);

export default router;
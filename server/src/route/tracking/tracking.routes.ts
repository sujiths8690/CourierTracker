import { Router } from "express";
import {
  updateLocation,
  getCurrentLocation,
  getTrackingLogsController
} from "../../controller/tracking/tracking.controller";

const router = Router();

router.patch("/updateLocation/:id", updateLocation);
router.get("/current/:id", getCurrentLocation);
router.get("/logs/:bookingId", getTrackingLogsController);

export default router;
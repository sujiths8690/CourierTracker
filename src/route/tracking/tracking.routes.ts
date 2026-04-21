import { Router } from "express";
import {
  updateLocation,
  getCurrentLocation
} from "../../controller/tracking/tracking.controller";

const router = Router();

router.patch("/updateLocation/:id", updateLocation);
router.get("/current/:id", getCurrentLocation);

export default router;
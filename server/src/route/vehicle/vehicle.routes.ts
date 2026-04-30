import { Router } from "express";
import {
  createVehicle,
  updateVehicle,
  getAllVehicles,
  getVehicleById,
  deleteVehicle,
  getNearbyVehiclesController,  
  updateVehicleLocationController,
  updateVehicleAvailabilityController
} from "../../controller/vehicle/vehicle.controller";

import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createVehicle);
router.put("/:id", authenticate, updateVehicle);

// 🔥 IMPORTANT: place this BEFORE /:id
router.get("/nearby", authenticate, getNearbyVehiclesController);

router.get("/", authenticate, getAllVehicles);
router.get("/:id", authenticate, getVehicleById);

router.delete("/:id", authenticate, deleteVehicle);
router.put("/:id/location", updateVehicleLocationController);
router.patch("/:id/availability", authenticate, updateVehicleAvailabilityController);

export default router;

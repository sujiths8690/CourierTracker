import { Router } from "express";
import {
  createVehicle,
  updateVehicle,
  getAllVehicles,
  getVehicleById,
  deleteVehicle,
  getNearbyVehiclesController  
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

export default router;
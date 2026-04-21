import { Router } from "express";
import {
  createVehicle,
  updateVehicle,
  getAllVehicles,
  getVehicleById,
  deleteVehicle
} from "../../controller/vehicle/vehicle.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createVehicle);
router.put("/:id", authenticate, updateVehicle);
router.get("/", authenticate, getAllVehicles);
router.get("/:id", authenticate, getVehicleById);
router.delete("/:id", authenticate, deleteVehicle);

export default router;
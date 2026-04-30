"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vehicle_controller_1 = require("../../controller/vehicle/vehicle.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.authenticate, vehicle_controller_1.createVehicle);
router.put("/:id", auth_middleware_1.authenticate, vehicle_controller_1.updateVehicle);
// 🔥 IMPORTANT: place this BEFORE /:id
router.get("/nearby", auth_middleware_1.authenticate, vehicle_controller_1.getNearbyVehiclesController);
router.get("/", auth_middleware_1.authenticate, vehicle_controller_1.getAllVehicles);
router.get("/:id", auth_middleware_1.authenticate, vehicle_controller_1.getVehicleById);
router.delete("/:id", auth_middleware_1.authenticate, vehicle_controller_1.deleteVehicle);
router.put("/:id/location", vehicle_controller_1.updateVehicleLocationController);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tracking_controller_1 = require("../../controller/tracking/tracking.controller");
const router = (0, express_1.Router)();
router.patch("/updateLocation/:id", tracking_controller_1.updateLocation);
router.get("/current/:id", tracking_controller_1.getCurrentLocation);
router.get("/logs/:bookingId", tracking_controller_1.getTrackingLogsController);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../../controller/dashboard/dashboard.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.authenticate, dashboard_controller_1.dashboard);
exports.default = router;

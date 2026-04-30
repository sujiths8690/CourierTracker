"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboard = void 0;
const dashboard_services_1 = require("../../service/dashboard/dashboard.services");
const dashboard = async (_req, res) => {
    try {
        const data = await (0, dashboard_services_1.getDashboardData)();
        res.status(200).json({
            message: "Dashboard fetched successfully",
            data
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Failed to fetch dashboard"
        });
    }
};
exports.dashboard = dashboard;

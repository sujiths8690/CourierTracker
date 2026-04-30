"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVehicleLocationController = exports.getNearbyVehiclesController = exports.deleteVehicle = exports.getVehicleById = exports.getAllVehicles = exports.updateVehicle = exports.createVehicle = void 0;
const vehicle_services_1 = __importStar(require("../../service/vehicle/vehicle.services"));
const createVehicle = async (req, res) => {
    try {
        const result = await vehicle_services_1.default.createVehicle(req.body);
        res.status(201).json({
            message: "Vehicle created successfully",
            data: result
        });
    }
    catch (err) {
        if (err.message === "VEHICLE_EXISTS") {
            return res.status(409).json({ message: "Vehicle already exists" });
        }
        res.status(500).json({ message: err.message });
    }
};
exports.createVehicle = createVehicle;
const updateVehicle = async (req, res) => {
    try {
        const vehicleId = Number(req.params.id);
        if (isNaN(vehicleId)) {
            return res.status(400).json({
                message: "Invalid vehicle ID"
            });
        }
        const result = await vehicle_services_1.default.updateVehicle(vehicleId, req.body);
        res.json({
            message: "Vehicle updated successfully",
            data: result
        });
    }
    catch (err) {
        if (err.message === "VEHICLE_NOT_FOUND") {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        res.status(500).json({ message: err.message });
    }
};
exports.updateVehicle = updateVehicle;
const getAllVehicles = async (_req, res) => {
    try {
        const result = await vehicle_services_1.default.getAllVehicles();
        res.json({
            message: "Vehicles fetched successfully",
            data: result
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getAllVehicles = getAllVehicles;
const getVehicleById = async (req, res) => {
    try {
        const vehicleId = Number(req.params.id);
        if (isNaN(vehicleId)) {
            return res.status(400).json({
                message: "Invalid vehicle ID"
            });
        }
        const result = await vehicle_services_1.default.getVehicleById(vehicleId);
        res.json({
            message: "Vehicle fetched successfully",
            data: result
        });
    }
    catch (err) {
        if (err.message === "VEHICLE_NOT_FOUND") {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        res.status(500).json({ message: err.message });
    }
};
exports.getVehicleById = getVehicleById;
const deleteVehicle = async (req, res) => {
    try {
        const vehicleId = Number(req.params.id);
        if (isNaN(vehicleId)) {
            return res.status(400).json({
                message: "Invalid vehicle ID"
            });
        }
        const result = await vehicle_services_1.default.deleteVehicle(vehicleId);
        res.json(result);
    }
    catch (err) {
        if (err.message === "VEHICLE_NOT_FOUND") {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        res.status(500).json({ message: err.message });
    }
};
exports.deleteVehicle = deleteVehicle;
const getNearbyVehiclesController = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({
                message: "lat & lng required"
            });
        }
        const vehicles = await (0, vehicle_services_1.getNearbyVehicles)(Number(lat), Number(lng));
        res.json({
            message: "Nearby vehicles fetched",
            data: vehicles
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Failed to fetch nearby vehicles"
        });
    }
};
exports.getNearbyVehiclesController = getNearbyVehiclesController;
const updateVehicleLocationController = async (req, res) => {
    try {
        const vehicleId = Number(req.params.id);
        const { lat, lng } = req.body;
        // ✅ Validation
        if (isNaN(vehicleId)) {
            return res.status(400).json({
                message: "Invalid vehicle ID"
            });
        }
        if (lat === undefined || lng === undefined) {
            return res.status(400).json({
                message: "lat & lng are required"
            });
        }
        // ✅ Call service
        const result = await vehicle_services_1.default.updateVehicleLocation(vehicleId, Number(lat), Number(lng));
        res.json({
            message: "Vehicle location updated",
            data: result
        });
    }
    catch (err) {
        if (err.message === "VEHICLE_NOT_FOUND") {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }
        res.status(500).json({
            message: err.message
        });
    }
};
exports.updateVehicleLocationController = updateVehicleLocationController;

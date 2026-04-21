import { Request, Response } from "express";
import vehicleService from "../../service/vehicle/vehicle.services";

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.createVehicle(req.body);

    res.status(201).json({
      message: "Vehicle created successfully",
      data: result
    });

  } catch (err: any) {

    if (err.message === "VEHICLE_EXISTS") {
      return res.status(409).json({ message: "Vehicle already exists" });
    }

    res.status(500).json({ message: err.message });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleId = Number(req.params.id);

    if (isNaN(vehicleId)) {
      return res.status(400).json({
        message: "Invalid vehicle ID"
      });
    }

    const result = await vehicleService.updateVehicle(
      vehicleId,
      req.body
    );

    res.json({
      message: "Vehicle updated successfully",
      data: result
    });

  } catch (err: any) {

    if (err.message === "VEHICLE_NOT_FOUND") {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(500).json({ message: err.message });
  }
};

export const getAllVehicles = async (_req: Request, res: Response) => {
  try {
    const result = await vehicleService.getAllVehicles();

    res.json({
      message: "Vehicles fetched successfully",
      data: result
    });

  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const vehicleId = Number(req.params.id);

    if (isNaN(vehicleId)) {
      return res.status(400).json({
        message: "Invalid vehicle ID"
      });
    }

    const result = await vehicleService.getVehicleById(vehicleId);

    res.json({
      message: "Vehicle fetched successfully",
      data: result
    });

  } catch (err: any) {

    if (err.message === "VEHICLE_NOT_FOUND") {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(500).json({ message: err.message });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleId = Number(req.params.id);

    if (isNaN(vehicleId)) {
      return res.status(400).json({
        message: "Invalid vehicle ID"
      });
    }

    const result = await vehicleService.deleteVehicle(vehicleId);

    res.json(result);

  } catch (err: any) {

    if (err.message === "VEHICLE_NOT_FOUND") {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(500).json({ message: err.message });
  }
};
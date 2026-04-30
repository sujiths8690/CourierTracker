import { Request, Response } from "express";
import vehicleService, { getNearbyVehicles } from "../../service/vehicle/vehicle.services";

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

export const getNearbyVehiclesController = async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: "lat & lng required"
      });
    }

    const vehicles = await getNearbyVehicles(
      Number(lat),
      Number(lng)
    );

    res.json({
      message: "Nearby vehicles fetched",
      data: vehicles
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch nearby vehicles"
    });
  }
};

export const updateVehicleLocationController = async (req: Request, res: Response) => {
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
    const result = await vehicleService.updateVehicleLocation(
      vehicleId,
      Number(lat),
      Number(lng)
    );

    res.json({
      message: "Vehicle location updated",
      data: result
    });

  } catch (err: any) {

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

export const updateVehicleAvailabilityController = async (req: Request, res: Response) => {
  try {
    const vehicleId = Number(req.params.id);
    const { available, lat, lng } = req.body;
    const authVehicleId = (req as any).user?.vehicleId;

    if (isNaN(vehicleId)) {
      return res.status(400).json({
        message: "Invalid vehicle ID"
      });
    }

    if (authVehicleId && Number(authVehicleId) !== vehicleId) {
      return res.status(403).json({
        message: "You can only update your assigned vehicle"
      });
    }

    if (typeof available !== "boolean") {
      return res.status(400).json({
        message: "available must be true or false"
      });
    }

    const result = await vehicleService.updateVehicleAvailability(
      vehicleId,
      available,
      lat !== undefined ? Number(lat) : undefined,
      lng !== undefined ? Number(lng) : undefined
    );

    res.json({
      message: available ? "Vehicle marked available" : "Vehicle marked unavailable",
      data: result
    });

  } catch (err: any) {

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

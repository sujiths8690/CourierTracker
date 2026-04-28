import { Request, Response } from "express";
import * as trackingService from "../../service/tracking/tracking.services";

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const bookingId = Number(req.params.id);
    const { lat, lng } = req.body;

    if (isNaN(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID"
      });
    }

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        message: "Invalid coordinates"
      });
    }

    const result = await trackingService.updateLocationService({
      bookingId,
      lat,
      lng
    });

    res.json(result);

  } catch (err: any) {

    if (err.message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(500).json({ message: err.message });
  }
};

export const getCurrentLocation = async (req: Request, res: Response) => {
  try {
    const bookingId = Number(req.params.id);

    const result = await trackingService.getCurrentLocation(bookingId);

    res.json(result);

  } catch (err: any) {

    if (err.message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(500).json({ message: err.message });
  }
};

export const getTrackingLogsController = async (req: Request, res: Response) => {
  try {
    const bookingId = Number(req.params.bookingId);

    const logs = await trackingService.getTrackingLogs(bookingId);

    res.json({
      message: "Logs fetched",
      data: logs
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};
import { Request, Response } from "express";
import * as bookingService from "../../service/booking/booking.services";

export const createBooking = async (req: Request, res: Response) => {
  try {
    console.log("USER:", (req as any).user);
    const result = await bookingService.createBooking({
      ...req.body,
      userId: (req as any).user.userId
    });

    res.status(201).json({
      message: "Booking created successfully",
      ...result,
      trackingLink: `/track/${result.booking.trackingToken}`
    });

  } catch (err: any) {

    if (err.message === "CUSTOMER_NOT_FOUND") {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (err.message === "VEHICLE_BUSY") {
      return res.status(409).json({ message: "Vehicle not available" });
    }

    if (err.message === "VEHICLE_NOT_FOUND") {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(500).json({ message: err.message });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = Number(req.params.id);

    const result = await bookingService.updateBooking(
      bookingId,
      req.body
    );

    res.json({
      message: "Booking updated successfully",
      ...result
    });

  } catch (err: any) {

    if (err.message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(500).json({ message: err.message });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const bookingId = Number(req.params.id);

    const result = await bookingService.getBookingById(bookingId);

    res.json({
      message: "Booking fetched successfully",
      data: result
    });

  } catch (err: any) {

    if (err.message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(500).json({ message: err.message });
  }
};

export const getAllBookingsController = async (req: Request, res: Response) => {
  try {
    const bookings = await bookingService.getAllBookings();

    res.status(200).json({
      message: "Bookings fetched successfully",
      data: bookings
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch bookings"
    });
  }
};

export const getDriverBookingsController = async (req: Request, res: Response) => {
  try {
    const vehicleId = Number((req as any).user?.vehicleId);

    if (isNaN(vehicleId)) {
      return res.status(401).json({
        message: "Driver vehicle not found in token"
      });
    }

    const bookings = await bookingService.getPendingBookingsForVehicle(vehicleId);

    res.status(200).json({
      message: "Driver bookings fetched successfully",
      data: bookings
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch driver bookings"
    });
  }
};

export const getDriverBookingHistoryController = async (req: Request, res: Response) => {
  try {
    const vehicleId = Number((req as any).user?.vehicleId);

    if (isNaN(vehicleId)) {
      return res.status(401).json({
        message: "Driver vehicle not found in token"
      });
    }

    const bookings = await bookingService.getDriverBookingHistory(vehicleId);

    res.status(200).json({
      message: "Driver booking history fetched successfully",
      data: bookings
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch driver booking history"
    });
  }
};

export const acceptDriverBookingController = async (req: Request, res: Response) => {
  try {
    const bookingId = Number(req.params.id);
    const vehicleId = Number((req as any).user?.vehicleId);
    const { lat, lng } = req.body;

    if (isNaN(bookingId) || isNaN(vehicleId)) {
      return res.status(400).json({
        message: "Invalid booking or vehicle ID"
      });
    }

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        message: "Driver location is required"
      });
    }

    const updated = await bookingService.acceptDriverBooking(
      bookingId,
      vehicleId,
      Number(lat),
      Number(lng)
    );

    res.json({
      message: "Booking accepted",
      data: updated
    });

  } catch (err: any) {

    if (err.message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({ message: "Booking request not found" });
    }

    res.status(500).json({ message: err.message });
  }
};

export const rejectDriverBookingController = async (req: Request, res: Response) => {
  try {
    const bookingId = Number(req.params.id);
    const vehicleId = Number((req as any).user?.vehicleId);

    if (isNaN(bookingId) || isNaN(vehicleId)) {
      return res.status(400).json({
        message: "Invalid booking or vehicle ID"
      });
    }

    const updated = await bookingService.rejectDriverBooking(
      bookingId,
      vehicleId
    );

    res.json({
      message: "Booking rejected",
      data: updated
    });

  } catch (err: any) {

    if (err.message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({ message: "Booking request not found" });
    }

    res.status(500).json({ message: err.message });
  }
};

export const confirmDriverPickupController = async (req: Request, res: Response) => {
  try {
    const bookingId = Number(req.params.id);
    const vehicleId = Number((req as any).user?.vehicleId);
    const { lat, lng } = req.body;

    if (isNaN(bookingId) || isNaN(vehicleId)) {
      return res.status(400).json({
        message: "Invalid booking or vehicle ID"
      });
    }

    const updated = await bookingService.confirmDriverPickup(
      bookingId,
      vehicleId,
      lat !== undefined ? Number(lat) : undefined,
      lng !== undefined ? Number(lng) : undefined
    );

    res.json({
      message: "Pickup confirmed",
      data: updated
    });

  } catch (err: any) {

    if (err.message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({ message: "Active booking not found" });
    }

    res.status(500).json({ message: err.message });
  }
};

export const confirmDriverDeliveryController = async (req: Request, res: Response) => {
  try {
    const bookingId = Number(req.params.id);
    const vehicleId = Number((req as any).user?.vehicleId);
    const { lat, lng } = req.body;

    if (isNaN(bookingId) || isNaN(vehicleId)) {
      return res.status(400).json({
        message: "Invalid booking or vehicle ID"
      });
    }

    const updated = await bookingService.confirmDriverDelivery(
      bookingId,
      vehicleId,
      lat !== undefined ? Number(lat) : undefined,
      lng !== undefined ? Number(lng) : undefined
    );

    res.json({
      message: "Delivery confirmed",
      data: updated
    });

  } catch (err: any) {

    if (err.message === "BOOKING_NOT_FOUND") {
      return res.status(404).json({ message: "Active booking not found" });
    }

    res.status(500).json({ message: err.message });
  }
};

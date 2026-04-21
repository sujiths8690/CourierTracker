import { Request, Response } from "express";
import * as bookingService from "../../service/booking/booking.services";

export const createBooking = async (req: Request, res: Response) => {
  try {
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

export const getBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = Number(req.params.id);

    const result = await bookingService.getBooking(bookingId);

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
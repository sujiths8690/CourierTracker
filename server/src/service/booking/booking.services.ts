import { prisma } from "../../utils/prisma";
import { v4 as uuidv4 } from "uuid";
import { getDistanceAndTime } from "../../utils/distance";
import { getDistance } from "../../utils/geo";
import { getRoute } from "../../utils/getRoute";

interface BookingInput {
  vehicleId: number;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  customerId: number;
  userId?: number;
}

export const createBooking = async (data: BookingInput) => {
  try {
    const {
      vehicleId,
      pickupLat,
      pickupLng,
      pickupAddress,
      customerId,
      userId
    } = data;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) throw new Error("CUSTOMER_NOT_FOUND");

    const vehicle = await prisma.vehicleDetails.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle) throw new Error("VEHICLE_NOT_FOUND");
    if (vehicle.status === "BUSY") throw new Error("VEHICLE_BUSY");

    const destLat = customer.lat;
    const destLng = customer.lng;
    const destAddress = customer.address;

    const { etaMinutes, distanceKm } = await getDistanceAndTime(
      { lat: pickupLat, lng: pickupLng },
      { lat: destLat, lng: destLng }
    );

    const route = await getRoute(
      pickupLat,
      pickupLng,
      destLat,
      destLng
    );

    const booking = await prisma.$transaction(async (tx) => {

      const created = await tx.vehicleBooking.create({
        data: {
          vehicleId,
          pickupLat,
          pickupLng,
          pickupAddress,
          destLat,
          destLng,
          destAddress,
          customerId,
          userId,
          status: "PENDING",
          trackingToken: uuidv4(),
          bookingId: `BK${Date.now()}`,
          route:route
        }
      });

      await tx.vehicleDetails.update({
        where: { id: vehicleId },
        data: { status: "BUSY" }
      });

      return created;
    });
    

    return {
      booking,
      etaMinutes,
      distanceKm
    };

  } catch (err: any) {
    console.error("Error creating booking", err);
    throw err;
  }
};

export const updateBooking = async (bookingId: number, data: any) => {
  try {
    const booking = await prisma.vehicleBooking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) throw new Error("BOOKING_NOT_FOUND");

    if (booking.status === "COMPLETED") {
      throw new Error("CANNOT_UPDATE_ACTIVE_BOOKING");
    }

    let newCustomerId = booking.customerId;
    let destLat = booking.destLat;
    let destLng = booking.destLng;
    let destAddress = booking.destAddress;

    if (data.customerId && data.customerId !== booking.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId }
      });

      if (!customer) throw new Error("CUSTOMER_NOT_FOUND");

      newCustomerId = data.customerId;
      destLat = customer.lat;
      destLng = customer.lng;
      destAddress = customer.address;
    }

    let newVehicleId = booking.vehicleId;

    if (data.vehicleId && data.vehicleId !== booking.vehicleId) {
      const vehicle = await prisma.vehicleDetails.findUnique({
        where: { id: data.vehicleId }
      });

      if (!vehicle) throw new Error("VEHICLE_NOT_FOUND");
      if (vehicle.status === "BUSY") throw new Error("VEHICLE_NOT_AVAILABLE");

      newVehicleId = data.vehicleId;
    }

    const updated = await prisma.$transaction(async (tx) => {

      if (newVehicleId !== booking.vehicleId) {
        await tx.vehicleDetails.update({
          where: { id: booking.vehicleId },
          data: { status: "AVAILABLE" }
        });

        await tx.vehicleDetails.update({
          where: { id: newVehicleId },
          data: { status: "BUSY" }
        });
      }

      const updatedBooking = await tx.vehicleBooking.update({
        where: { id: bookingId },
        data: {
          vehicleId: newVehicleId,
          pickupLat: data.pickupLat ?? booking.pickupLat,
          pickupLng: data.pickupLng ?? booking.pickupLng,
          pickupAddress: data.pickupAddress ?? booking.pickupAddress,
          destLat,
          destLng,
          destAddress,
          customerId: newCustomerId,
          status: data.status ?? booking.status
        }
      });

      return updatedBooking; // 🔥 VERY IMPORTANT
    });

    // 🔥 START SIMULATION WHEN CONFIRMED
    if (data.status === "ONGOING") {
      console.log("Tracking simulation started!!!!!")
    }

    return { updated };

  } catch (err: any) {
    console.error("Error updating booking", err);
    throw err;
  }
};

export const getBookingById = async (bookingId: number) => {
  try {
    const booking = await prisma.vehicleBooking.findUnique({
      where: { id: bookingId },
      include: {
        Customer: true,
        VehicleDetails: true
      }
    });

    if (!booking) throw new Error("BOOKING_NOT_FOUND");

    return booking;

  } catch (err: any) {
    console.error("Error fetching booking", err);
    throw err;
  }
};

export const getAllBookings = async () => {
  try {
    const bookings = await prisma.vehicleBooking.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        Customer: true,
        VehicleDetails: true
      }
    });

    return bookings;

  } catch (err: any) {
    console.error("Error fetching bookings", err);
    throw err;
  }
};

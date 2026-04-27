import { prisma } from "../../utils/prisma";
import { getDistance } from "../../utils/geo";
import { sendVehicleLocationUpdate } from "../../sockets/tracking.socket";

interface LocationInput {
  bookingId: number;
  lat: number;
  lng: number;
}

export const updateLocationService = async (data: LocationInput) => {
  try {
    const { bookingId, lat, lng } = data;

    const booking = await prisma.vehicleBooking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) throw new Error("BOOKING_NOT_FOUND");

    if (booking.status === "COMPLETED") {
      return { message: "Booking already completed!" };
    }

    let shouldSave = true;

    // movement check
    if (booking.lastLat !== null && booking.lastLng !== null) {
      const moved = getDistance(
        booking.lastLat,
        booking.lastLng,
        lat,
        lng
      );

      if (moved < 10) {
        shouldSave = false;
      }
    }

    if (!shouldSave) {
      return { message: "No significant movement" };
    }

    // save log
    await prisma.trackingLog.create({
      data: {
        bookingId,
        lat,
        lng
      }
    });

    // update booking current location
    await prisma.vehicleBooking.update({
      where: { id: bookingId },
      data: {
        lastLat: lat,
        lastLng: lng,
        lastUpdated: new Date(),
        status: "ONGOING"
      }
    });

    // 🔥 ADD THIS BLOCK (VERY IMPORTANT)
    await prisma.vehicleDetails.update({
      where: { id: booking.vehicleId },
      data: {
        lastLat: lat,
        lastLng: lng,
        lastUpdated: new Date()
      }
    });

    // 🔥 ALSO ADD THIS (for live map updates)
    sendVehicleLocationUpdate(booking.vehicleId, lat, lng);

    // check destination
    const distToDest = getDistance(
      lat,
      lng,
      booking.destLat,
      booking.destLng
    );

    if (distToDest < 10) {
      await prisma.$transaction(async (tx) => {

        await tx.vehicleBooking.update({
          where: { id: bookingId },
          data: { status: "COMPLETED" }
        });

        await tx.vehicleDetails.update({
          where: { id: booking.vehicleId },
          data: { status: "AVAILABLE" }
        });

      });

      return { message: "Trip completed!" };
    }

    return { message: "Location updated" };

  } catch (err: any) {
    console.error("Tracking error", err);
    throw err;
  }
};

export const getCurrentLocation = async (bookingId: number) => {
  try {
    const booking = await prisma.vehicleBooking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) throw new Error("BOOKING_NOT_FOUND");

    return {
      lat: booking.lastLat,
      lng: booking.lastLng,
      status: booking.status
    };

  } catch (err: any) {
    console.error("Get location error", err);
    throw err;
  }
};
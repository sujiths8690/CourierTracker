import { getDistance } from "../../utils/geo";
import { prisma } from "../../utils/prisma";
import { VehicleDetails_status, VehicleDetails_type } from "@prisma/client";

interface VehicleInput {
  number: string;
  type: VehicleDetails_type;
  pricePerKm?: number;
  ownerName: string;          // ✅ ADD
  ownerMobile: string;        
  ownerPassword: string; 
}

interface VehicleUpdateInput {
  number?: string;
  type?: VehicleDetails_type;
  status?: VehicleDetails_status;
  pricePerKm?: number;

  ownerName?: string;      // ✅ ADD
  ownerMobile?: string;
}

export const createVehicle = async (data: VehicleInput) => {
  try {
    const {
      number,
      type,
      pricePerKm,
      ownerName,
      ownerMobile,
      ownerPassword
    } = data;

    const formattedNumber = number.replace(/\s+/g, "").toUpperCase();

    const existing = await prisma.vehicleDetails.findUnique({
      where: { number: formattedNumber }
    });

    if (existing) {
      throw new Error("VEHICLE_EXISTS");
    }

    // 🔥 Use transaction (important)
    const result = await prisma.$transaction(async (tx) => {

      // 1️⃣ Create vehicle
      const vehicle = await tx.vehicleDetails.create({
        data: {
          number: formattedNumber,
          type,
          pricePerKm
        }
      });

      // 2️⃣ Create OWNER
      await tx.vehicleUser.create({
        data: {
          name: ownerName,
          mobileNumber: ownerMobile,
          password: ownerPassword, // ⚠️ hash this in real app
          type: "OWNER",
          vehicleId: vehicle.id
        }
      });

      return vehicle;
    });

    return result;

  } catch (err: any) {
    console.error("Error creating vehicle", err);
    throw err;
  }
};

export const updateVehicle = async (
  vehicleId: number,
  data: VehicleUpdateInput
) => {
  try {
    const existing = await prisma.vehicleDetails.findUnique({
      where: { id: vehicleId },
      include: { VehicleUser: true } // 🔥 include users
    });

    if (!existing) {
      throw new Error("VEHICLE_NOT_FOUND");
    }

    const {
      ownerName,
      ownerMobile,
      ...vehicleData
    } = data;

    const result = await prisma.$transaction(async (tx) => {

      // 1️⃣ Update vehicle
      const updatedVehicle = await tx.vehicleDetails.update({
        where: { id: vehicleId },
        data: vehicleData
      });

      // 2️⃣ Find OWNER
      const owner = existing.VehicleUser.find(
        (u) => u.type === "OWNER"
      );

      // 3️⃣ Update owner if exists
      if (owner && (ownerName || ownerMobile)) {
        await tx.vehicleUser.update({
          where: { id: owner.id },
          data: {
            ...(ownerName && { name: ownerName }),
            ...(ownerMobile && { mobileNumber: ownerMobile })
          }
        });
      }

      // 4️⃣ If no owner exists (edge case) → create one
      if (!owner && ownerName) {
        await tx.vehicleUser.create({
          data: {
            name: ownerName,
            mobileNumber: ownerMobile || "",
            password: "123456", // ⚠️ temp
            type: "OWNER",
            vehicleId
          }
        });
      }

      return updatedVehicle;
    });

    return result;

  } catch (err: any) {
    console.error("Error updating vehicle", err);
    throw err;
  }
};

export const getAllVehicles = async () => {
  try {
    const vehicles = await prisma.vehicleDetails.findMany({
      where: { isActive: true },
      orderBy: { id: "desc" },
      include: {
        VehicleUser: true // 🔥 ADD THIS
      }
    });

    // 🔥 Extract owner for each vehicle
    return vehicles.map((vehicle) => {
      const owner = vehicle.VehicleUser.find(
        (u) => u.type === "OWNER"
      );

      return {
        ...vehicle,
        owner: owner?.name || null,
        ownerMobile: owner?.mobileNumber || null 
      };
    });

  } catch (err: any) {
    console.error("Error fetching vehicles", err);
    throw err;
  }
};

export const getVehicleById = async (vehicleId: number) => {
  try {
    const vehicle = await prisma.vehicleDetails.findUnique({
      where: { id: vehicleId },
      include: {
        VehicleUser: true   // ✅ include all users
      }
    });

    if (!vehicle) throw new Error("VEHICLE_NOT_FOUND");

    // 🎯 Extract OWNER
    const owner = vehicle.VehicleUser.find(u => u.type === "OWNER");

    return {
      ...vehicle,
      owner: owner?.name || null   // ✅ flatten for frontend
    };

  } catch (err: any) {
    console.error("Error fetching vehicle", err);
    throw err;
  }
};

export const deleteVehicle = async (vehicleId: number) => {
  try {
    const existing = await prisma.vehicleDetails.findUnique({
      where: { id: vehicleId }
    });

    if (!existing) {
      throw new Error("VEHICLE_NOT_FOUND");
    }

    await prisma.vehicleDetails.update({
      where: { id: vehicleId },
      data: { isActive: false }
    });

    return { message: "Vehicle deleted successfully" };

  } catch (err: any) {
    console.error("Error deleting vehicle", err);
    throw err;
  }
};

export const getNearbyVehicles = async (
  pickupLat: number,
  pickupLng: number
) => {
  try {
    const vehicles = await prisma.vehicleDetails.findMany({
      where: {
        isActive: true,
        status: "AVAILABLE"
      }
    });

    const enriched = vehicles.map((v) => {
      if (!v.lastLat || !v.lastLng) return null;

      const distance = getDistance(
        pickupLat,
        pickupLng,
        v.lastLat,
        v.lastLng
      );

      const avgSpeed = 30; // km/h
      const eta = (distance / avgSpeed) * 60; // minutes

      return {
        ...v,
        distance: Number(distance.toFixed(2)),
        eta: Math.round(eta),
        estimatedPrice: v.pricePerKm
          ? Math.round(distance * v.pricePerKm)
          : 0
      };
    });

    return enriched
      .filter((v): v is NonNullable<typeof v> => v !== null)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

  } catch (err) {
    console.error("Nearby vehicles error", err);
    throw err;
  }
};

const vehicleService = {
  createVehicle,
  updateVehicle,
  getAllVehicles,
  getVehicleById,
  deleteVehicle,
  getNearbyVehicles
};

export default vehicleService;
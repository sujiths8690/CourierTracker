import { prisma } from "../../utils/prisma";
import { VehicleDetails_status, VehicleDetails_type } from "@prisma/client";

interface VehicleInput {
  number: string;
  type: VehicleDetails_type;
  pricePerKm?: number;
}

interface VehicleUpdateInput {
  number?: string;
  type?: VehicleDetails_type;
  status?: VehicleDetails_status;
  pricePerKm?: number;
}

export const createVehicle = async (data: VehicleInput) => {
  try {
    const { number, type, pricePerKm } = data;

    const formattedNumber = number.replace(/\s+/g, "").toUpperCase();

    const existing = await prisma.vehicleDetails.findUnique({
      where: { number: formattedNumber }
    });

    if (existing) {
      throw new Error("VEHICLE_EXISTS");
    }

    const vehicle = await prisma.vehicleDetails.create({
      data: {
        number: formattedNumber,
        type,
        pricePerKm
      }
    });

    return vehicle;

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
      where: { id: vehicleId }
    });

    if (!existing) {
      throw new Error("VEHICLE_NOT_FOUND");
    }

    const updated = await prisma.vehicleDetails.update({
      where: { id: vehicleId },
      data
    });

    return updated;

  } catch (err: any) {
    console.error("Error updating vehicle", err);
    throw err;
  }
};

export const getAllVehicles = async () => {
  try {
    return await prisma.vehicleDetails.findMany({
      where: { isActive: true },
      orderBy: { id: "desc" }
    });

  } catch (err: any) {
    console.error("Error fetching vehicles", err);
    throw err;
  }
};

export const getVehicleById = async (vehicleId: number) => {
  try {
    const vehicle = await prisma.vehicleDetails.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle) {
      throw new Error("VEHICLE_NOT_FOUND");
    }

    return vehicle;

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

const vehicleService = {
  createVehicle,
  updateVehicle,
  getAllVehicles,
  getVehicleById,
  deleteVehicle
};

export default vehicleService;
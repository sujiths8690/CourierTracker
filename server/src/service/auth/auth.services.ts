import { prisma } from "../../utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const registerUser = async (data: any) => {
  const { name, email, password } = data;

  const existing = await prisma.user.findUnique({
    where: { email }
  });

  if (existing) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      type: "STAFF"
    }
  });

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.type
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    token
  };
};

export const loginUser = async (data: any) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.type
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    token
  };
};

export const loginVehicleUser = async (data: any) => {
  const { mobileNumber, phone, password } = data;
  const rawMobile = String(mobileNumber || phone || "").trim();
  const loginMobile = rawMobile.replace(/\D/g, "");

  if (!loginMobile || !password) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const vehicleUsers = await prisma.vehicleUser.findMany({
    where: {
      isActive: true,
      OR: [
        { mobileNumber: loginMobile },
        { mobileNumber: rawMobile },
        { mobileNumber: { endsWith: loginMobile } }
      ]
    },
    include: {
      VehicleDetails: true
    }
  });

  if (!vehicleUsers.length) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const checkPassword = async (storedPassword: string) => {
    if (storedPassword === password) return true;

    try {
      return await bcrypt.compare(password, storedPassword);
    } catch {
      return false;
    }
  };

  const orderedVehicleUsers = [...vehicleUsers].sort((a, b) => {
    if (a.type === b.type) return 0;
    return a.type === "DRIVER" ? -1 : 1;
  });

  let driver = null;

  for (const vehicleUser of orderedVehicleUsers) {
    if (await checkPassword(vehicleUser.password)) {
      driver = vehicleUser;
      break;
    }
  }

  if (!driver) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = jwt.sign(
    {
      vehicleUserId: driver.id,
      vehicleId: driver.vehicleId,
      role: driver.type
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    driver: {
      id: driver.id,
      name: driver.name,
      phone: driver.mobileNumber,
      mobileNumber: driver.mobileNumber,
      type: driver.type,
      vehicleId: driver.vehicleId,
      vehicle: driver.VehicleDetails,
      totalTrips: 0,
      rating: 4.8
    },
    token
  };
};

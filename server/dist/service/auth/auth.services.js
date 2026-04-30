"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginVehicleUser = exports.loginUser = exports.registerUser = void 0;
const prisma_1 = require("../../utils/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const registerUser = async (data) => {
    const { name, email, password } = data;
    const existing = await prisma_1.prisma.user.findUnique({
        where: { email }
    });
    if (existing) {
        throw new Error("USER_ALREADY_EXISTS");
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await prisma_1.prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            type: "STAFF"
        }
    });
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
        role: user.type
    }, JWT_SECRET, { expiresIn: "7d" });
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        },
        token
    };
};
exports.registerUser = registerUser;
const loginUser = async (data) => {
    const { email, password } = data;
    const user = await prisma_1.prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new Error("INVALID_CREDENTIALS");
    }
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
        role: user.type
    }, JWT_SECRET, { expiresIn: "7d" });
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        },
        token
    };
};
exports.loginUser = loginUser;
const loginVehicleUser = async (data) => {
    const { mobileNumber, phone, password } = data;
    const rawMobile = String(mobileNumber || phone || "").trim();
    const loginMobile = rawMobile.replace(/\D/g, "");
    if (!loginMobile || !password) {
        throw new Error("INVALID_CREDENTIALS");
    }
    const vehicleUsers = await prisma_1.prisma.vehicleUser.findMany({
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
    const checkPassword = async (storedPassword) => {
        if (storedPassword === password)
            return true;
        try {
            return await bcrypt_1.default.compare(password, storedPassword);
        }
        catch {
            return false;
        }
    };
    const orderedVehicleUsers = [...vehicleUsers].sort((a, b) => {
        if (a.type === b.type)
            return 0;
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
    const token = jsonwebtoken_1.default.sign({
        vehicleUserId: driver.id,
        vehicleId: driver.vehicleId,
        role: driver.type
    }, JWT_SECRET, { expiresIn: "7d" });
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
exports.loginVehicleUser = loginVehicleUser;

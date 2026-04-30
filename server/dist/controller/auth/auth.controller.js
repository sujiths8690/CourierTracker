"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const auth_services_1 = require("../../service/auth/auth.services");
const register = async (req, res) => {
    try {
        const result = await (0, auth_services_1.registerUser)(req.body);
        res.status(201).json({
            message: "User registered successfully",
            ...result
        });
    }
    catch (err) {
        if (err.message === "USER_ALREADY_EXISTS") {
            return res.status(409).json({ message: "Email already exists" });
        }
        res.status(500).json({ message: err.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const result = await (0, auth_services_1.loginUser)(req.body);
        res.json({
            message: "Login successful",
            ...result
        });
    }
    catch (err) {
        if (err.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        res.status(500).json({ message: err.message });
    }
};
exports.login = login;

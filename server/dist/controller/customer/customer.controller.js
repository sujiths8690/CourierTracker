"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.getCustomerById = exports.getAllCustomers = exports.updateCustomer = exports.createCustomer = void 0;
const customer_services_1 = __importDefault(require("../../service/customer/customer.services"));
const createCustomer = async (req, res) => {
    try {
        const result = await customer_services_1.default.createCustomer(req.body);
        res.status(201).json({
            message: "Customer created successfully",
            data: result
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
    try {
        const customerId = Number(req.params.id);
        if (isNaN(customerId)) {
            return res.status(400).json({
                message: "Invalid customer ID"
            });
        }
        const result = await customer_services_1.default.updateCustomer(customerId, req.body);
        res.json({
            message: "Customer updated successfully",
            data: result
        });
    }
    catch (err) {
        if (err.message === "CUSTOMER_NOT_FOUND") {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.status(500).json({ message: err.message });
    }
};
exports.updateCustomer = updateCustomer;
const getAllCustomers = async (_req, res) => {
    try {
        const result = await customer_services_1.default.getAllCustomers();
        res.json({
            message: "Customers fetched successfully",
            data: result
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getAllCustomers = getAllCustomers;
const getCustomerById = async (req, res) => {
    try {
        const customerId = Number(req.params.id);
        if (isNaN(customerId)) {
            return res.status(400).json({
                message: "Invalid customer ID"
            });
        }
        const result = await customer_services_1.default.getCustomerById(customerId);
        res.json({
            message: "Customer fetched successfully",
            data: result
        });
    }
    catch (err) {
        if (err.message === "CUSTOMER_NOT_FOUND") {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.status(500).json({ message: err.message });
    }
};
exports.getCustomerById = getCustomerById;
const deleteCustomer = async (req, res) => {
    try {
        const customerId = Number(req.params.id);
        if (isNaN(customerId)) {
            return res.status(400).json({
                message: "Invalid customer ID"
            });
        }
        const result = await customer_services_1.default.deleteCustomer(customerId);
        res.json(result);
    }
    catch (err) {
        if (err.message === "CUSTOMER_NOT_FOUND") {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.status(500).json({ message: err.message });
    }
};
exports.deleteCustomer = deleteCustomer;

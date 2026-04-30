"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.getCustomerById = exports.getAllCustomers = exports.updateCustomer = exports.createCustomer = void 0;
const prisma_1 = require("../../utils/prisma");
const createCustomer = async (data) => {
    try {
        const { name, address, lat, lng, mobileNumber } = data;
        const customer = await prisma_1.prisma.customer.create({
            data: {
                name,
                address,
                lat,
                lng,
                mobileNumber
            }
        });
        return customer;
    }
    catch (err) {
        console.error("Error creating customer", err);
        throw err;
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (customerId, data) => {
    try {
        const existing = await prisma_1.prisma.customer.findUnique({
            where: { id: customerId }
        });
        if (!existing) {
            throw new Error("CUSTOMER_NOT_FOUND");
        }
        const updated = await prisma_1.prisma.customer.update({
            where: { id: customerId },
            data
        });
        return updated;
    }
    catch (err) {
        console.error("Error updating customer", err);
        throw err;
    }
};
exports.updateCustomer = updateCustomer;
const getAllCustomers = async () => {
    try {
        const customers = await prisma_1.prisma.customer.findMany({
            where: { isActive: true },
            orderBy: { id: "desc" }
        });
        return customers;
    }
    catch (err) {
        console.error("Error fetching customers", err);
        throw err;
    }
};
exports.getAllCustomers = getAllCustomers;
const getCustomerById = async (customerId) => {
    try {
        const customer = await prisma_1.prisma.customer.findUnique({
            where: { id: customerId }
        });
        if (!customer) {
            throw new Error("CUSTOMER_NOT_FOUND");
        }
        return customer;
    }
    catch (err) {
        console.error("Error fetching customer", err);
        throw err;
    }
};
exports.getCustomerById = getCustomerById;
const deleteCustomer = async (customerId) => {
    try {
        const existing = await prisma_1.prisma.customer.findUnique({
            where: { id: customerId }
        });
        if (!existing) {
            throw new Error("CUSTOMER_NOT_FOUND");
        }
        await prisma_1.prisma.customer.update({
            where: { id: customerId },
            data: { isActive: false }
        });
        return { message: "Customer deleted successfully" };
    }
    catch (err) {
        console.error("Error deleting customer", err);
        throw err;
    }
};
exports.deleteCustomer = deleteCustomer;
const customerService = {
    createCustomer: exports.createCustomer,
    updateCustomer: exports.updateCustomer,
    getAllCustomers: exports.getAllCustomers,
    getCustomerById: exports.getCustomerById,
    deleteCustomer: exports.deleteCustomer
};
exports.default = customerService;

import { prisma } from "../../utils/prisma";

interface CustomerInput {
  name: string;
  address: string;
  lat: number;
  lng: number;
  mobileNumber?: string;
}

export const createCustomer = async (data: CustomerInput) => {
  try {
    const { name, address, lat, lng, mobileNumber } = data;

    const customer = await prisma.customer.create({
      data: {
        name,
        address,
        lat,
        lng,
        mobileNumber
      }
    });

    return customer;

  } catch (err: any) {
    console.error("Error creating customer", err);
    throw err;
  }
};

export const updateCustomer = async (
  customerId: number,
  data: Partial<CustomerInput>
) => {
  try {
    const existing = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!existing) {
      throw new Error("CUSTOMER_NOT_FOUND");
    }

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data
    });

    return updated;

  } catch (err: any) {
    console.error("Error updating customer", err);
    throw err;
  }
};

export const getAllCustomers = async () => {
  try {
    const customers = await prisma.customer.findMany({
      where: { isActive: true },
      orderBy: { id: "desc" }
    });

    return customers;

  } catch (err: any) {
    console.error("Error fetching customers", err);
    throw err;
  }
};

export const getCustomerById = async (customerId: number) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      throw new Error("CUSTOMER_NOT_FOUND");
    }

    return customer;

  } catch (err: any) {
    console.error("Error fetching customer", err);
    throw err;
  }
};

export const deleteCustomer = async (customerId: number) => {
  try {
    const existing = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!existing) {
      throw new Error("CUSTOMER_NOT_FOUND");
    }

    await prisma.customer.update({
      where: { id: customerId },
      data: { isActive: false }
    });

    return { message: "Customer deleted successfully" };

  } catch (err: any) {
    console.error("Error deleting customer", err);
    throw err;
  }
};

const customerService = {
  createCustomer,
  updateCustomer,
  getAllCustomers,
  getCustomerById,
  deleteCustomer
};

export default customerService;
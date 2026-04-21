import { Request, Response } from "express";
import customerService from "../../service/customer/customer.services";

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const result = await customerService.createCustomer(req.body);

    res.status(201).json({
      message: "Customer created successfully",
      data: result
    });

  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const customerId = Number(req.params.id);

    if (isNaN(customerId)) {
      return res.status(400).json({
        message: "Invalid customer ID"
      });
    }

    const result = await customerService.updateCustomer(
      customerId,
      req.body
    );

    res.json({
      message: "Customer updated successfully",
      data: result
    });

  } catch (err: any) {

    if (err.message === "CUSTOMER_NOT_FOUND") {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(500).json({ message: err.message });
  }
};

export const getAllCustomers = async (_req: Request, res: Response) => {
  try {
    const result = await customerService.getAllCustomers();

    res.json({
      message: "Customers fetched successfully",
      data: result
    });

  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customerId = Number(req.params.id);

    if (isNaN(customerId)) {
      return res.status(400).json({
        message: "Invalid customer ID"
      });
    }

    const result = await customerService.getCustomerById(customerId);

    res.json({
      message: "Customer fetched successfully",
      data: result
    });

  } catch (err: any) {

    if (err.message === "CUSTOMER_NOT_FOUND") {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(500).json({ message: err.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customerId = Number(req.params.id);

    if (isNaN(customerId)) {
      return res.status(400).json({
        message: "Invalid customer ID"
      });
    }

    const result = await customerService.deleteCustomer(customerId);

    res.json(result);

  } catch (err: any) {

    if (err.message === "CUSTOMER_NOT_FOUND") {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(500).json({ message: err.message });
  }
};
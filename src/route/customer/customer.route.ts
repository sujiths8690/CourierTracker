import { Router } from "express";
import {
  createCustomer,
  updateCustomer,
  getAllCustomers,
  getCustomerById,
  deleteCustomer
} from "../../controller/customer/customer.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createCustomer);
router.put("/:id", authenticate,updateCustomer);
router.get("/", authenticate, getAllCustomers);
router.get("/:id", authenticate, getCustomerById);
router.delete("/:id", authenticate, deleteCustomer);

export default router;
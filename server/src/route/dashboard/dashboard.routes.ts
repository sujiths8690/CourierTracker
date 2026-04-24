import { Router } from "express";
import { dashboard } from "../../controller/dashboard/dashboard.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, dashboard);

export default router;
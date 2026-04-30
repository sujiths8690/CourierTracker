import { Router } from "express";
import { register, login, driverLogin } from "../../controller/auth/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/driver-login", driverLogin);

export default router;

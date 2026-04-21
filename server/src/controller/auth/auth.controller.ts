import { Request, Response } from "express";
import { loginUser, registerUser } from "../../service/auth/auth.services";

export const register = async (req: Request, res: Response) => {
  try {
    const result = await registerUser(req.body);

    res.status(201).json({
      message: "User registered successfully",
      ...result
    });

  } catch (err: any) {

    if (err.message === "USER_ALREADY_EXISTS") {
      return res.status(409).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginUser(req.body);

    res.json({
      message: "Login successful",
      ...result
    });

  } catch (err: any) {

    if (err.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(500).json({ message: err.message });
  }
};
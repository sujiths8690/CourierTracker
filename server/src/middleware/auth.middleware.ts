import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // attach user to request
    (req as any).user = {
      userId: decoded.userId,
      vehicleUserId: decoded.vehicleUserId,
      vehicleId: decoded.vehicleId,
      role: decoded.role
    };

    next();

  } catch (err) {
    return res.status(401).json({
      message: "Invalid token"
    });
  }
};

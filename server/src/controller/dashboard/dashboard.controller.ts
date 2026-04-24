import { Request, Response } from "express";
import { getDashboardData } from "../../service/dashboard/dashboard.services";

export const dashboard = async (_req: Request, res: Response) => {
  try {
    const data = await getDashboardData();

    res.status(200).json({
      message: "Dashboard fetched successfully",
      data
    });

  } catch (err: any) {
    res.status(500).json({
      message: "Failed to fetch dashboard"
    });
  }
};
import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";

import { WebSocketServer } from "ws";
import { initTrackingSocket } from "./sockets/tracking.socket";

import bookingRoute from "./route/booking/booking.route";
import authRoutes from "./route/auth/auth.route";
import vehicleRoutes from "./route/vehicle/vehicle.routes";
import trackingRoutes from "./route/tracking/tracking.routes";
import customerRoutes from "./route/customer/customer.route";
import dashboardRoutes from "./route/dashboard/dashboard.routes";
import { startVehicleSimulation } from "./utils/vehicleSimulation";

dotenv.config();

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

initTrackingSocket(wss);

console.log("DB URL:", process.env.DATABASE_URL);

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/api/booking", bookingRoute);
app.use("/api/auth", authRoutes);
app.use("/api/vehicle", vehicleRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (_req, res) => {
  res.send("Welcome to Courier Tracker!");
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK" });
});

const port = Number(process.env.PORT) || 3003;

server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on ${port}`);

  startVehicleSimulation();
});
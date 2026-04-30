"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const ws_1 = require("ws");
const tracking_socket_1 = require("./sockets/tracking.socket");
const booking_route_1 = __importDefault(require("./route/booking/booking.route"));
const auth_route_1 = __importDefault(require("./route/auth/auth.route"));
const vehicle_routes_1 = __importDefault(require("./route/vehicle/vehicle.routes"));
const tracking_routes_1 = __importDefault(require("./route/tracking/tracking.routes"));
const customer_route_1 = __importDefault(require("./route/customer/customer.route"));
const dashboard_routes_1 = __importDefault(require("./route/dashboard/dashboard.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
(0, tracking_socket_1.initTrackingSocket)(wss);
console.log("DB URL:", process.env.DATABASE_URL);
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
app.use("/api/booking", booking_route_1.default);
app.use("/api/auth", auth_route_1.default);
app.use("/api/vehicle", vehicle_routes_1.default);
app.use("/api/tracking", tracking_routes_1.default);
app.use("/api/customer", customer_route_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
app.get("/", (_req, res) => {
    res.send("Welcome to Courier Tracker!");
});
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "OK" });
});
const port = Number(process.env.PORT) || 3003;
server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on ${port}`);
});

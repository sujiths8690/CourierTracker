"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVehicleLocationUpdate = exports.sendTripCompleted = exports.sendLocationUpdate = exports.initTrackingSocket = void 0;
const ws_1 = __importDefault(require("ws"));
let wss;
// 🔹 Initialize WebSocket server
const initTrackingSocket = (server) => {
    wss = server;
    wss.on("connection", (ws) => {
        console.log("Client connected");
        ws.on("message", (data) => {
            try {
                const message = JSON.parse(data.toString());
                // 🔹 Subscribe to booking
                if (message.type === "SUBSCRIBE") {
                    if (!message.bookingId) {
                        return ws.send(JSON.stringify({
                            type: "ERROR",
                            message: "bookingId required"
                        }));
                    }
                    ws.bookingId = message.bookingId;
                    ws.send(JSON.stringify({
                        type: "SUBSCRIBED",
                        bookingId: message.bookingId
                    }));
                }
                // 🔹 Unsubscribe (optional but good)
                if (message.type === "UNSUBSCRIBE") {
                    ws.bookingId = undefined;
                    ws.send(JSON.stringify({
                        type: "UNSUBSCRIBED"
                    }));
                }
                if (message.type === "SUBSCRIBE_MAP") {
                    ws.mapSubscribed = true;
                    ws.send(JSON.stringify({
                        type: "MAP_SUBSCRIBED"
                    }));
                }
                // 🔹 Ping
                if (message.type === "PING") {
                    ws.send(JSON.stringify({ type: "PONG" }));
                }
            }
            catch (err) {
                ws.send(JSON.stringify({
                    type: "ERROR",
                    message: "Invalid message format"
                }));
            }
        });
        ws.on("close", () => {
            console.log("Client disconnected");
        });
    });
};
exports.initTrackingSocket = initTrackingSocket;
const sendLocationUpdate = (bookingId, lat, lng) => {
    if (!wss)
        return;
    const message = JSON.stringify({
        type: "LOCATION_UPDATE",
        lat,
        lng
    });
    wss.clients.forEach((client) => {
        const ws = client;
        if (ws.readyState === ws_1.default.OPEN &&
            ws.bookingId === bookingId) {
            ws.send(message);
        }
    });
};
exports.sendLocationUpdate = sendLocationUpdate;
const sendTripCompleted = (bookingId) => {
    if (!wss)
        return;
    const message = JSON.stringify({
        type: "TRIP_COMPLETED"
    });
    wss.clients.forEach((client) => {
        const ws = client;
        if (ws.readyState === ws_1.default.OPEN &&
            ws.bookingId === bookingId) {
            ws.send(message);
        }
    });
};
exports.sendTripCompleted = sendTripCompleted;
const sendVehicleLocationUpdate = (vehicleId, lat, lng) => {
    if (!wss)
        return;
    const message = JSON.stringify({
        type: "VEHICLE_LOCATION",
        vehicleId,
        lat,
        lng
    });
    wss.clients.forEach((client) => {
        const ws = client;
        if (ws.readyState === ws_1.default.OPEN &&
            ws.mapSubscribed) {
            ws.send(message);
        }
    });
};
exports.sendVehicleLocationUpdate = sendVehicleLocationUpdate;

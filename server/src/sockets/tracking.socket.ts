import WebSocket, { WebSocketServer } from "ws";

interface TrackingSocket extends WebSocket {
  bookingId?: number;
  vehicleId?: number;
}

let wss: WebSocketServer;


// 🔹 Initialize WebSocket Server
let flushTimer: NodeJS.Timeout | null = null;

export const initTrackingSocket = (server: WebSocketServer) => {
  wss = server;

  wss.on("connection", (ws: TrackingSocket) => {
    console.log("🔌 Client connected");

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "SUBSCRIBE") {
          ws.bookingId = message.bookingId;

          ws.send(JSON.stringify({
            type: "SUBSCRIBED",
            bookingId: message.bookingId
          }));
        }

        if (message.type === "SUBSCRIBE_VEHICLE") {
          ws.vehicleId = message.vehicleId;

          ws.send(JSON.stringify({
            type: "VEHICLE_SUBSCRIBED",
            vehicleId: message.vehicleId
          }));
        }

        if (message.type === "PING") {
          ws.send(JSON.stringify({ type: "PONG" }));
        }
      } catch {
        console.log("Invalid WS message");
      }
    });

    ws.on("close", () => {
      console.log("❌ Client disconnected");
    });
  });
};


export const sendVehicleLocationUpdate = (
  bookingId: number,
  lat: number,
  lng: number
) => {
  if (!wss) return;

  const message = JSON.stringify({
    type: "VEHICLE_LOCATION",
    bookingId,
    lat,
    lng
  });

  wss.clients.forEach((client) => {
    const ws = client as TrackingSocket;

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
};

export const sendTripCompleted = (bookingId: number) => {
  if (!wss) return;

  const message = JSON.stringify({
    type: "TRIP_COMPLETED",
    bookingId
  });

  wss.clients.forEach((client) => {
    const ws = client as TrackingSocket;

    if (
      ws.readyState === WebSocket.OPEN &&
      ws.bookingId === bookingId
    ) {
      ws.send(message);
    }
  });
};

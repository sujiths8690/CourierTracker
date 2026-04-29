import WebSocket, { WebSocketServer } from "ws";

interface TrackingSocket extends WebSocket {
  bookingId?: number;
  mapSubscribed?: boolean;
}

let wss: WebSocketServer;

// 🔹 Initialize WebSocket server
export const initTrackingSocket = (server: WebSocketServer) => {
  wss = server;

  wss.on("connection", (ws: TrackingSocket) => {
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

      } catch (err) {
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

export const sendLocationUpdate = (
  bookingId: number,
  lat: number,
  lng: number
) => {
  if (!wss) return;

  const message = JSON.stringify({
    type: "LOCATION_UPDATE",
    lat,
    lng
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

export const sendTripCompleted = (bookingId: number) => {
  if (!wss) return;

  const message = JSON.stringify({
    type: "TRIP_COMPLETED"
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

export const sendVehicleLocationUpdate = (
  vehicleId: number,
  lat: number,
  lng: number
) => {
  if (!wss) return;

  const message = JSON.stringify({
    type: "VEHICLE_LOCATION",
    vehicleId,
    lat,
    lng
  });

  wss.clients.forEach((client) => {
    const ws = client as TrackingSocket;

    if (
      ws.readyState === WebSocket.OPEN &&
      ws.mapSubscribed
    ) {
      ws.send(message);
    }
  });
};

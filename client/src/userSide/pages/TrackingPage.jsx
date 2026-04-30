import { useDispatch, useSelector } from "react-redux";
import { fetchBookingById } from "../../redux/features/booking/bookingActions";
import { selectSelectedBooking } from "../../redux/features/booking/bookingSelector";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import TrackingMap from "../components/TrackingMap";
import { fetchTrackingLogs } from "../../redux/features/tracking/trackingActions";
import { getDistanceKm } from "../../utils/distance";
import { clearTrackingData } from "../../redux/features/tracking/trackingSlice";
import { clearBooking } from "../../redux/features/booking/bookingSlice";

const AVERAGE_SPEED_KMPH = 30;
const PICKUP_REACHED_THRESHOLD_KM = 0.06;
const DEPARTED_THRESHOLD_KM = 0.08;

const addMinutes = (date, minutes) => {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
};

const formatDateTime = (value) => {
  if (!value) return "Waiting...";

  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getPlaceName = (address, fallback) => {
  if (!address) return fallback;

  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts[0] || fallback;
};

const getAddressPlaceName = (address = {}, displayName = "") =>
  address.city ||
  address.town ||
  address.village ||
  address.municipality ||
  address.suburb ||
  address.neighbourhood ||
  address.county ||
  getPlaceName(displayName, "current area");

const estimateTravelTime = (from, to) => {
  if (!from || !to) return 0;

  const distance = getDistanceKm(from.lat, from.lng, to.lat, to.lng);
  return (distance / AVERAGE_SPEED_KMPH) * 60;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getRouteProgress = (route, position) => {
  if (!route || route.length < 2 || !position) return 0;

  let closestIndex = 0;
  let closestDistance = Infinity;

  route.forEach(([lat, lng], index) => {
    const distance = getDistanceKm(position[0], position[1], lat, lng);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex / (route.length - 1);
};

const getTrackingPathKey = (bookingId) => `tracking-covered-path:${bookingId}`;

const getPointKey = ([lat, lng]) => `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;

const getSampleKey = ({ lat, lng, time }) =>
  `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)},${Math.round(Number(time) / 1000)}`;

const normalizePath = (path = []) =>
  path
    .filter((point) => (
      Array.isArray(point) &&
      point.length === 2 &&
      point.every((value) => Number.isFinite(Number(value)))
    ))
    .map(([lat, lng]) => [Number(lat), Number(lng)]);

const mergePaths = (...paths) => {
  const seen = new Set();
  const merged = [];

  paths.flatMap(normalizePath).forEach((point) => {
    const key = getPointKey(point);

    if (seen.has(key)) return;

    seen.add(key);
    merged.push(point);
  });

  return merged;
};

const mergeMovementSamples = (...sampleGroups) => {
  const seen = new Set();

  return sampleGroups
    .flat()
    .filter((sample) => (
      sample &&
      Number.isFinite(Number(sample.lat)) &&
      Number.isFinite(Number(sample.lng)) &&
      Number.isFinite(Number(sample.time))
    ))
    .map((sample) => ({
      lat: Number(sample.lat),
      lng: Number(sample.lng),
      time: Number(sample.time)
    }))
    .sort((a, b) => a.time - b.time)
    .filter((sample) => {
      const key = getSampleKey(sample);

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    })
    .slice(-8);
};

const getTrafficSummary = (samples) => {
  if (!samples || samples.length < 2) {
    return {
      label: "calculating",
      detail: "traffic data warming up",
      speed: null
    };
  }

  const latest = samples[samples.length - 1];
  const previous = [...samples]
    .reverse()
    .find((sample) => sample.time < latest.time);

  if (!previous) {
    return {
      label: "calculating",
      detail: "traffic data warming up",
      speed: null
    };
  }

  const distance = getDistanceKm(previous.lat, previous.lng, latest.lat, latest.lng);
  const hours = (latest.time - previous.time) / 3600000;
  const speed = hours > 0 ? distance / hours : 0;

  if (speed >= 25) {
    return {
      label: "clear",
      detail: `moving ${Math.round(speed)} km/h`,
      speed
    };
  }

  if (speed >= 10) {
    return {
      label: "moderate",
      detail: `moving ${Math.round(speed)} km/h`,
      speed
    };
  }

  return {
    label: "heavy",
    detail: `slow movement, ${Math.round(speed)} km/h`,
    speed
  };
};

export default function TrackingPage({ bookingId, setPage, t }) {
  const dispatch = useDispatch();
  const booking = useSelector(selectSelectedBooking);

  const [vehiclePos, setVehiclePos] = useState(null);
  const [coveredPath, setCoveredPath] = useState([]);
  const [pickupReachedAt, setPickupReachedAt] = useState(null);
  const [departedAt, setDepartedAt] = useState(null);
  const [deliveredAt, setDeliveredAt] = useState(null);
  const [currentPlace, setCurrentPlace] = useState("");
  const [movementSamples, setMovementSamples] = useState([]);
  const latestPositionRef = useRef({ time: 0, source: "init" });
  const lastPlaceLookupRef = useRef({ pos: null, time: 0 });

  console.log("BOOKING ID:", bookingId);

  const logs = useSelector(state => state.tracking.logs);
  const logsBookingId = useSelector(state => state.tracking.currentBookingId);

  const setLatestVehiclePos = useCallback((pos, sourceTime, source, options = {}) => {
    const time = sourceTime ? new Date(sourceTime).getTime() : Date.now();
    const safeTime = Number.isFinite(time) ? time : Date.now();

    if (!options.force && safeTime < latestPositionRef.current.time) return;

    latestPositionRef.current = {
      time: safeTime,
      source
    };

    setVehiclePos(pos);
  }, []);

  const updateCoveredPath = useCallback((updater) => {
    setCoveredPath((previousPath) => {
      const nextPath = typeof updater === "function"
        ? updater(previousPath)
        : updater;
      const normalizedPath = normalizePath(nextPath);

      if (bookingId && typeof window !== "undefined") {
        window.localStorage.setItem(
          getTrackingPathKey(bookingId),
          JSON.stringify(normalizedPath)
        );
      }

      return normalizedPath;
    });
  }, [bookingId]);

  const updateMovementSamples = useCallback((samples) => {
    setMovementSamples((previousSamples) => (
      mergeMovementSamples(previousSamples, samples)
    ));
  }, []);

  useEffect(() => {
    if (!bookingId || typeof window === "undefined") return;

    const savedPath = window.localStorage.getItem(getTrackingPathKey(bookingId));
    if (!savedPath) {
      // 🔥 Clear old path when loading new booking
      setCoveredPath([]);
      setVehiclePos(null);
      return;
    }

    try {
      const parsedPath = JSON.parse(savedPath);
      const restoredPath = normalizePath(parsedPath);

      if (restoredPath.length > 0) {
        updateCoveredPath(restoredPath);
        setLatestVehiclePos(
          restoredPath[restoredPath.length - 1],
          Date.now(),
          "saved-path"
        );
      }
    } catch {
      window.localStorage.removeItem(getTrackingPathKey(bookingId));
      setCoveredPath([]);
    }
  }, [bookingId, setLatestVehiclePos, updateCoveredPath]);

  useEffect(() => {
    if (!bookingId) return;

    // 🔥 Clear old state when booking changes
    dispatch(clearBooking());
    dispatch(clearTrackingData());
    setCoveredPath([]);
    setVehiclePos(null);
    setPickupReachedAt(null);
    setDepartedAt(null);
    setDeliveredAt(null);
    setCurrentPlace("");
    setMovementSamples([]);
    latestPositionRef.current = { time: 0, source: "init" };
    lastPlaceLookupRef.current = { pos: null, time: 0 };

    dispatch(fetchBookingById(bookingId));
    dispatch(fetchTrackingLogs(bookingId));
  }, [bookingId, dispatch]);

  useEffect(() => {
    if (!bookingId) return;

    // 🔥 Stop polling if delivery is complete
    if (booking?.status === "COMPLETED") return;

    const interval = setInterval(() => {
      dispatch(fetchBookingById(bookingId));
      dispatch(fetchTrackingLogs(bookingId));
    }, 10000);

    return () => clearInterval(interval);
  }, [bookingId, dispatch, booking?.status]);

  useEffect(() => {
  if (!logs || logs.length === 0 || logsBookingId !== bookingId) return;

  const path = logs.map(l => [l.lat, l.lng]);
  const logSamples = logs.map((log) => ({
    lat: log.lat,
    lng: log.lng,
    time: new Date(log.createdAt).getTime()
  }));

  updateCoveredPath((previousPath) => mergePaths(previousPath, path));
  updateMovementSamples(logSamples);

  if (path.length > 0) {
    const lastLog = logs[logs.length - 1];
    setLatestVehiclePos(
      path[path.length - 1],
      lastLog?.createdAt,
      "tracking-log"
    );
  }
}, [bookingId, logs, logsBookingId, setLatestVehiclePos, updateCoveredPath, updateMovementSamples]);

  useEffect(() => {
    if (!booking || !logs || logs.length === 0 || logsBookingId !== bookingId) return;

    const firstPickupLog = logs.find((log) => (
      getDistanceKm(log.lat, log.lng, booking.pickupLat, booking.pickupLng) <=
      PICKUP_REACHED_THRESHOLD_KM
    ));

    if (!pickupReachedAt && firstPickupLog?.createdAt) {
      setPickupReachedAt(firstPickupLog.createdAt);
    }

    const firstDepartedLog = firstPickupLog
      ? logs.find((log) => (
          new Date(log.createdAt) > new Date(firstPickupLog.createdAt) &&
          getDistanceKm(log.lat, log.lng, booking.pickupLat, booking.pickupLng) >=
            DEPARTED_THRESHOLD_KM
        ))
      : null;

    if (!departedAt && firstDepartedLog?.createdAt) {
      setDepartedAt(firstDepartedLog.createdAt);
    }

    const firstDeliveryLog = logs.find((log) => (
      getDistanceKm(log.lat, log.lng, booking.destLat, booking.destLng) <=
      PICKUP_REACHED_THRESHOLD_KM
    ));

    if (!deliveredAt && firstDeliveryLog?.createdAt) {
      setDeliveredAt(firstDeliveryLog.createdAt);
    }
  }, [booking, bookingId, departedAt, deliveredAt, logs, logsBookingId, pickupReachedAt]);

  useEffect(() => {
    if (!booking) return;

    // priority 1: last known vehicle position
    if (booking.lastLat && booking.lastLng) {
      setLatestVehiclePos(
        [booking.lastLat, booking.lastLng],
        booking.lastUpdated || booking.updatedAt,
        "booking"
      );
      return;
    }

    // fallback: pickup location only before any real position has arrived
    if (
      latestPositionRef.current.time === 0 &&
      booking.pickupLat &&
      booking.pickupLng
    ) {
      setVehiclePos([booking.pickupLat, booking.pickupLng]);
    }
  }, [booking, setLatestVehiclePos]);

  // 🔥 Initialize vehicle position from booking
  useEffect(() => {
    if (!bookingId) return;

    const ws = new WebSocket("ws://192.168.1.84:3003");

    ws.onopen = () => {
      console.log("✅ WS Connected");

      // 🔵 booking tracking
      ws.send(JSON.stringify({
        type: "SUBSCRIBE",
        bookingId: bookingId
      }));

      // 🔵 vehicle map tracking (IMPORTANT)
      ws.send(JSON.stringify({
        type: "SUBSCRIBE_MAP"
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "VEHICLE_LOCATION") {
        // 🔥 Stop tracking if delivery is complete
        if (booking?.status === "COMPLETED") return;

        if (booking?.vehicleId === data.vehicleId) {
          const newPos = [data.lat, data.lng];

          console.log("WS POS:", data.lat, data.lng);

          setLatestVehiclePos(newPos, Date.now(), "websocket");
          updateMovementSamples([{
            lat: data.lat,
            lng: data.lng,
            time: Date.now()
          }]);

          // 🔥 THIS LINE CREATES GREEN PATH
          updateCoveredPath((previousPath) => mergePaths(previousPath, [newPos]));
        }
      }

      if (data.type === "TRIP_COMPLETED") {
        console.log("Trip completed");
        setDeliveredAt(new Date().toISOString());
        dispatch(fetchBookingById(bookingId));
      }
    };

    ws.onerror = (err) => {
      console.log("❌ WS Error", err);
    };

    ws.onclose = () => {
      console.log("🔌 WS Closed");
    };

    // ❗ IMPORTANT: only close on unmount
    return () => {
      ws.close();
    };

  }, [bookingId, booking?.vehicleId, dispatch, setLatestVehiclePos, updateCoveredPath, updateMovementSamples]); // 🔥 ONLY RUN ONCE

  useEffect(() => {
    if (!vehiclePos) return;

    const [lat, lng] = vehiclePos;
    const lastLookup = lastPlaceLookupRef.current;
    const movedDistance = lastLookup.pos
      ? getDistanceKm(lat, lng, lastLookup.pos[0], lastLookup.pos[1])
      : Infinity;
    const lookupAge = Date.now() - lastLookup.time;

    if (movedDistance < 1 && lookupAge < 30000) return;

    const controller = new AbortController();

    const fetchCurrentPlace = async () => {
      try {
        const res = await fetch(
          `https://us1.locationiq.com/v1/reverse?key=${import.meta.env.VITE_LOCATIONIQ_KEY}&lat=${lat}&lon=${lng}&format=json`,
          { signal: controller.signal }
        );

        const data = await res.json();
        const place = getAddressPlaceName(data.address, data.display_name);

        setCurrentPlace(place);
        lastPlaceLookupRef.current = {
          pos: [lat, lng],
          time: Date.now()
        };
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Current place lookup failed:", err);
        }
      }
    };

    fetchCurrentPlace();

    return () => controller.abort();
  }, [vehiclePos]);

  useEffect(() => {
    if (!booking) return;

    const status = booking.status;
    const bookingUpdatedAt = booking.updatedAt || new Date().toISOString();
    const destinationPos = [booking.destLat, booking.destLng];

    if (!pickupReachedAt && ["LOADING", "COMPLETED"].includes(status)) {
      setPickupReachedAt(bookingUpdatedAt);
    }

    if (!departedAt && status === "COMPLETED") {
      setDepartedAt(bookingUpdatedAt);
    }

    if (!deliveredAt && status === "COMPLETED") {
      setDeliveredAt(bookingUpdatedAt);
    }

    if (status === "COMPLETED") {
      setLatestVehiclePos(destinationPos, Date.now(), "completed-destination", {
        force: true
      });

      updateCoveredPath((previousPath) => {
        const logPath = logsBookingId === bookingId && logs?.length
          ? logs.map((log) => [log.lat, log.lng])
          : previousPath;

        return mergePaths(logPath, [destinationPos]);
      });
    }
  }, [
    booking,
    departedAt,
    deliveredAt,
    bookingId,
    logs,
    logsBookingId,
    pickupReachedAt,
    setLatestVehiclePos,
    updateCoveredPath
  ]);

  useEffect(() => {
    if (!booking || !vehiclePos) return;

    const [lat, lng] = vehiclePos;
    const distanceFromPickup = getDistanceKm(
      lat,
      lng,
      booking.pickupLat,
      booking.pickupLng
    );

    if (!pickupReachedAt && distanceFromPickup <= PICKUP_REACHED_THRESHOLD_KM) {
      setPickupReachedAt(new Date().toISOString());
    }

    if (
      pickupReachedAt &&
      !departedAt &&
      distanceFromPickup >= DEPARTED_THRESHOLD_KM
    ) {
      setDepartedAt(new Date().toISOString());
    }

    const distanceFromDestination = getDistanceKm(
      lat,
      lng,
      booking.destLat,
      booking.destLng
    );

    if (!deliveredAt && distanceFromDestination <= PICKUP_REACHED_THRESHOLD_KM) {
      setDeliveredAt(new Date().toISOString());
    }
  }, [booking, departedAt, deliveredAt, pickupReachedAt, vehiclePos]);

  // 🔥 Dynamic progress (fallback to backend progress if no route)
  const progress = useMemo(() => {
    if (!booking) return 0;

    if (booking.status === "COMPLETED") return 100;

    if (vehiclePos && booking.destLat && booking.destLng) {
      const distanceToDestination = getDistanceKm(
        vehiclePos[0],
        vehiclePos[1],
        booking.destLat,
        booking.destLng
      );

      if (distanceToDestination <= PICKUP_REACHED_THRESHOLD_KM) return 100;
    }

    if (!pickupReachedAt) return 0;

    if (!departedAt) return 33;

    const routeProgress = getRouteProgress(booking.route, vehiclePos);
    const deliveryProgress = 33 + (routeProgress * 67);

    return clamp(deliveryProgress, 34, 99);
  }, [booking, departedAt, pickupReachedAt, vehiclePos]);

  const timeline = useMemo(() => {
    if (!booking) return {};

    const now = new Date();
    const createdAt = booking.createdAt ? new Date(booking.createdAt) : now;
    const vehiclePoint = vehiclePos
      ? { lat: vehiclePos[0], lng: vehiclePos[1] }
      : booking.lastLat && booking.lastLng
      ? { lat: booking.lastLat, lng: booking.lastLng }
      : null;
    const pickupPoint = { lat: booking.pickupLat, lng: booking.pickupLng };
    const destinationPoint = { lat: booking.destLat, lng: booking.destLng };

    const expectedPickupAt =
      pickupReachedAt ||
      addMinutes(
        now,
        estimateTravelTime(vehiclePoint || pickupPoint, pickupPoint)
      );

    const expectedDeliveryStart = departedAt || pickupReachedAt || expectedPickupAt || createdAt;
    const expectedDeliveryAt =
      deliveredAt ||
      addMinutes(expectedDeliveryStart, estimateTravelTime(pickupPoint, destinationPoint));

    return {
      pickupTime: pickupReachedAt,
      departTime: departedAt,
      delivered: Boolean(deliveredAt || booking.status === "COMPLETED"),
      deliveredAt,
      expectedPickupAt,
      expectedDeliveryAt
    };
  }, [booking, deliveredAt, departedAt, pickupReachedAt, vehiclePos]);

  const infoCards = [
    {
      label: "Reached Pickup",
      value: timeline.pickupTime
        ? formatDateTime(timeline.pickupTime)
        : "Waiting...",
      helper: `Expected: ${formatDateTime(timeline.expectedPickupAt)}`,
      complete: Boolean(timeline.pickupTime)
    },
    {
      label: "Departed",
      value: timeline.departTime
        ? formatDateTime(timeline.departTime)
        : "Not yet",
      helper: timeline.pickupTime ? "Loaded and moving" : "After pickup",
      complete: Boolean(timeline.departTime)
    },
    {
      label: timeline.delivered ? "Delivered" : "Expected Delivery",
      value: timeline.delivered
        ? formatDateTime(timeline.deliveredAt)
        : formatDateTime(timeline.expectedDeliveryAt),
      helper: timeline.delivered ? "Delivery completed" : "ETA",
      complete: timeline.delivered,
      delivered: timeline.delivered
    }
  ];

  const milestones = [
    {
      label: "Package picked up",
      done: Boolean(timeline.pickupTime),
      active: !timeline.pickupTime,
      activeText: "Heading to pickup"
    },
    {
      label: "Out for delivery",
      done: Boolean(timeline.departTime),
      active: Boolean(timeline.pickupTime) && !timeline.departTime,
      activeText: "Loading package"
    },
    {
      label: "Delivered",
      done: Boolean(timeline.delivered),
      active: Boolean(timeline.departTime) && !timeline.delivered,
      activeText: "In progress"
    }
  ];

  const progressLine = useMemo(() => {
    if (!booking) return "";

    const pickupPlace = getPlaceName(booking.pickupAddress, "pickup point");
    const destinationPlace = getPlaceName(booking.destAddress, "delivery point");
    const currentTown = currentPlace || (departedAt ? pickupPlace : "current area");
    const nextPlace = departedAt ? destinationPlace : pickupPlace;
    const nextPoint = departedAt
      ? { lat: booking.destLat, lng: booking.destLng }
      : { lat: booking.pickupLat, lng: booking.pickupLng };
    const distanceToNext = vehiclePos
      ? getDistanceKm(vehiclePos[0], vehiclePos[1], nextPoint.lat, nextPoint.lng)
      : null;
    const distanceText = Number.isFinite(distanceToNext)
      ? `${distanceToNext.toFixed(1)} km`
      : "calculating distance";
    const traffic = getTrafficSummary(movementSamples);

    if (timeline.delivered) {
      return `Reached ${destinationPlace}. Delivery completed.`;
    }

    if (departedAt) {
      return `Reached ${currentTown}. Next ${nextPlace} in ${distanceText}. Traffic: ${traffic.label}, ${traffic.detail}.`;
    }

    if (pickupReachedAt) {
      return `Reached ${pickupPlace}. Next ${destinationPlace} after loading. Traffic: ${traffic.label}, ${traffic.detail}.`;
    }

    return `Vehicle near ${currentTown}. Pickup at ${nextPlace} in ${distanceText}. Traffic: ${traffic.label}, ${traffic.detail}.`;
  }, [
    booking,
    currentPlace,
    departedAt,
    movementSamples,
    pickupReachedAt,
    timeline.delivered,
    vehiclePos
  ]);

  const visibleCoveredPath = useMemo(() => {
    if (!vehiclePos) return coveredPath;

    return mergePaths(coveredPath, [vehiclePos]);
  }, [coveredPath, vehiclePos]);

  const trafficSummary = useMemo(
    () => getTrafficSummary(movementSamples),
    [movementSamples]
  );

  return (
    <div className="tracking-page" style={{ background: t.bg }}>
      <div className="tracking-wrapper">

        {/* Header */}
        <div className="tracking-header">
          <button
            className="tracking-back-btn"
            onClick={() => setPage("dashboard")}
            style={{ border: `1px solid ${t.border}`, color: t.text }}
          >
            ← Back
          </button>

          <h2 className="tracking-title" style={{ color: t.text }}>
            Live Tracking
          </h2>

          <span className="tracking-id" style={{ color: t.accent }}>
            {booking?.bookingId || booking?.id}
          </span>
        </div>

        <div className="tracking-layout">
          <div className="tracking-map-panel">
            <TrackingMap
              key={booking?.id || bookingId}
              t={t}
              booking={booking}
              vehiclePos={vehiclePos}
              coveredPath={visibleCoveredPath}
              traffic={trafficSummary}
            />
          </div>

          <div className="tracking-side-panel">
            <div
              className="card"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <div className="progress-header">
                <span style={{ color: t.textMuted, fontSize: 13 }}>
                  Journey Progress
                </span>
                <span style={{ fontWeight: 700, fontSize: 22, color: t.text }}>
                  {Math.round(progress)}%
                </span>
              </div>

              <div
                className="progress-bar-bg"
                style={{ background: t.surfaceAlt }}
              >
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${t.accent}, ${t.accentHover || t.accent})`,
                  }}
                />
              </div>

              {progressLine && (
                <div className="progress-route-line" style={{ color: t.textMuted }}>
                  {progressLine}
                </div>
              )}

              <div className="info-grid">
                {infoCards.map(({ label, value, helper, complete, delivered }) => (
                  <div
                    key={label}
                    className={`info-box ${complete ? "is-complete" : ""} ${
                      delivered ? "is-delivered" : ""
                    }`}
                    style={{
                      background: delivered
                        ? "#22c55e"
                        : t.surfaceAlt,
                      color: delivered
                        ? "#fff"
                        : t.text
                    }}
                  >
                    <div
                      className="info-label"
                      style={{ color: delivered ? "#dcfce7" : t.textMuted }}
                    >
                      {label}
                    </div>
                    <div
                      className="info-value"
                      style={{ color: delivered ? "#fff" : t.text }}
                      title={value}
                    >
                      {value}
                    </div>
                    <div
                      className="info-helper"
                      style={{ color: delivered ? "#dcfce7" : t.textMuted }}
                    >
                      {helper}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="card"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <div className="milestone-title" style={{ color: t.textMuted }}>
                Route Milestones
              </div>

              {milestones.map(({ label, done, active, activeText }, i) => {
                return (
                  <div
                    key={label}
                    className={`milestone-item ${i < 3 ? "border-bottom" : ""}`}
                    style={{ borderColor: t.border }}
                  >
                    <div
                      className="milestone-circle"
                      style={{
                        background: done
                          ? t.success
                          : active
                          ? t.accent
                          : t.surfaceAlt,
                        color: done || active ? "#fff" : t.textMuted,
                      }}
                    >
                      {done ? "✓" : i + 1}
                    </div>

                    <div>
                      <div
                        className="milestone-text"
                        style={{
                          color: done || active ? t.text : t.textMuted,
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {label}
                      </div>

                      {active && (
                        <div
                          className="milestone-active"
                          style={{ color: t.accent }}
                        >
                          ● {activeText}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

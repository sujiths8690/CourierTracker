// ─── CourierFlow Driver Portal — Mock Data ────────────────────────────────────
// Replace these with your real API calls / Redux state.

export const MOCK_DRIVER = {
  id:          "DRV-001",
  name:        "Rajan Thomas",
  phone:       "9876543210",
  password:    "driver123",
  vehicle:     "KL-07-BZ-4421",
  vehicleType: "Heavy Truck",
  rating:      4.8,
  totalTrips:  142,
};

export const MOCK_DELIVERIES = [
  {
    id: "BK-001", customer: "Arjun Menon",
    pickup: "Ernakulam North", destination: "MG Road, Kochi",
    distance: 8.2, earnings: 246, status: "delivered", date: "12 Apr 2026", progress: 100,
  },
  {
    id: "BK-007", customer: "Priya Nair",
    pickup: "Palarivattom Junction", destination: "Edapally, Kochi",
    distance: 5.4, earnings: 162, status: "delivered", date: "11 Apr 2026", progress: 100,
  },
  {
    id: "BK-009", customer: "Meera Pillai",
    pickup: "Aluva Railway Station", destination: "Perumbavoor",
    distance: 14.7, earnings: 441, status: "delivered", date: "10 Apr 2026", progress: 100,
  },
  {
    id: "BK-011", customer: "Suresh Kumar",
    pickup: "Kakkanad IT Park", destination: "Thrissur Bus Stand",
    distance: 62.3, earnings: 1869, status: "transit", date: "14 Apr 2026", progress: 61,
  },
];

export const MOCK_REQUESTS = [
  {
    id: "REQ-201",
    customer: "Divya Krishnan",
    phone: "9400112233",
    pickupAddress: "Kaloor Stadium, Kochi",
    pickupLat: 9.9896,
    pickupLng: 76.2886,
    destinationAddress: "Thrissur, Kerala",
    destinationLat: 10.5276,
    destinationLng: 76.2144,
    driverLat: 9.9312,
    driverLng: 76.2673,
    distToPickup: 6.2,
    pickupToDest: 54.8,
    totalKm: 61.0,
    estimatedEarnings: 1830,
    requestedAt: "Just now",
    isNew: true,
  },
  {
    id: "REQ-202",
    customer: "Arun Babu",
    phone: "9567889900",
    pickupAddress: "Vytilla Mobility Hub",
    pickupLat: 9.9597,
    pickupLng: 76.3167,
    destinationAddress: "Angamaly, Kerala",
    destinationLat: 10.1899,
    destinationLng: 76.3863,
    driverLat: 9.9312,
    driverLng: 76.2673,
    distToPickup: 4.8,
    pickupToDest: 26.3,
    totalKm: 31.1,
    estimatedEarnings: 933,
    requestedAt: "3 min ago",
    isNew: false,
  },
];
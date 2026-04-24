export const mockCustomers = [
  { id: 1, name: "Arjun Menon", address: "MG Road, Kochi, Kerala", lat: 9.9312, lng: 76.2673 },
  { id: 2, name: "Priya Nair", address: "Edapally, Kochi, Kerala", lat: 10.025, lng: 76.308 },
  { id: 3, name: "Suresh Kumar", address: "Thrissur, Kerala", lat: 10.5276, lng: 76.2144 },
];

export const mockVehicles = [
  { id: 1, number: "KL-07-BZ-4421", type: "Heavy Truck", owner: "Kerala Logistics Ltd", status: "Active" },
  { id: 2, number: "KL-14-AC-8830", type: "Mini Van", owner: "Fast Couriers Co", status: "In Transit" },
  { id: 3, number: "KL-01-XY-2200", type: "Motorbike", owner: "Rajesh T", status: "Idle" },
];

export const mockBookings = [
  { id: "BK-001", vehicleId: 1, customerId: 1, pickupAddress: "Ernakulam North", pickupLat: 9.987, pickupLng: 76.298, status: "Delivered", progress: 100 },
  { id: "BK-002", vehicleId: 2, customerId: 2, pickupAddress: "Palarivattom Junction", pickupLat: 10.001, pickupLng: 76.31, status: "In Transit", progress: 62 },
  { id: "BK-003", vehicleId: 3, customerId: 3, pickupAddress: "Aluva Railway Station", pickupLat: 10.108, pickupLng: 76.355, status: "Pending", progress: 0 },
];
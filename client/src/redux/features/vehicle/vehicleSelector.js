export const selectVehicleLoading = (state) => state.vehicle.loading;
export const selectVehicleError = (state) => state.vehicle.error;
export const selectVehicleSuccess = (state) => state.vehicle.success;

export const selectVehicles = (state) => state.vehicle.vehicles;
export const selectSelectedVehicle = (state) =>
  state.vehicle.selectedVehicle;

// 🔥 useful for UI filtering
export const selectAvailableVehicles = (state) =>
  state.vehicle.vehicles?.filter((v) => v.status === "AVAILABLE");

export const selectBusyVehicles = (state) =>
  state.vehicle.vehicles?.filter((v) => v.status === "BUSY");
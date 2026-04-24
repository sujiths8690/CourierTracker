export const selectTrackingLoading = (state) => state.tracking.loading;
export const selectTrackingError = (state) => state.tracking.error;

export const selectCurrentLocation = (state) =>
  state.tracking.currentLocation;

export const selectTrackingSuccess = (state) =>
  state.tracking.success;
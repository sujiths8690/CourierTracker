export const selectDriverAuthLoading = (state) => state.driverAuth.loading;
export const selectDriverAuthError = (state) => state.driverAuth.error;
export const selectDriverAuthSuccess = (state) => state.driverAuth.success;
export const selectDriver = (state) => state.driverAuth.driver;
export const selectDriverToken = (state) => state.driverAuth.token;
export const selectIsDriverAuthenticated = (state) =>
  state.driverAuth.isAuthenticated;

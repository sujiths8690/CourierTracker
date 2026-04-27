export const selectBookingLoading = (state) => state.booking.loading;
export const selectBookingError = (state) => state.booking.error;
export const selectBookingSuccess = (state) => state.booking.success;

export const selectBooking = (state) => state.booking.booking;
export const selectEta = (state) => state.booking.etaMinutes;
export const selectDistance = (state) => state.booking.distanceKm;
export const selectSelectedBooking = (state) =>
  state.booking.selectedBooking;
export const selectBookings = (state) => state.booking.bookings;
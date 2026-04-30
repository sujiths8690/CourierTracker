import { createSlice } from "@reduxjs/toolkit";
import {
  createBooking,
  fetchBookings,
  fetchBookingById,
  updateBooking,
} from "./bookingActions";

const initialState = {
  bookings: [],
  booking: null,
  selectedBooking: null,

  etaMinutes: null,
  distanceKm: null,

  loading: {
    global: false,
    fetchOne: false,
  },

  error: {
    global: null,
    fetchOne: null,
  },

  success: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,

  reducers: {
    clearSuccessMessage: (state) => {
      state.success = null;
    },
    clearErrorMessage: (state) => {
      state.error.global = null;
      state.error.fetchOne = null;
    },
    clearBooking: (state) => {
      state.booking = null;
      state.etaMinutes = null;
      state.distanceKm = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ➕ CREATE BOOKING
      .addCase(createBooking.pending, (state) => {
        state.loading.global = true;
        state.error.global = null;
      })
      .addCase(createBooking.fulfilled, (state, { payload }) => {
        state.loading.global = false;

        state.booking = payload.booking;
        state.etaMinutes = payload.etaMinutes;
        state.distanceKm = payload.distanceKm;

        state.success = "Booking created successfully";
      })
      .addCase(createBooking.rejected, (state, { payload }) => {
        state.loading.global = false;
        state.error.global = payload;
      })

      // 📄 FETCH BOOKING
      .addCase(fetchBookings.pending, (state) => {
        state.loading.global = true;
      })
      .addCase(fetchBookings.fulfilled, (state, { payload }) => {
        state.loading.global = false;
        state.bookings = payload;   // 🔥 THIS FIXES UI
      })
      .addCase(fetchBookings.rejected, (state, { payload }) => {
        state.loading.global = false;
        state.error.global = payload;
      })
      .addCase(fetchBookingById.pending, (state) => {
        state.loading.fetchOne = true;
        state.error.fetchOne = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading.fetchOne = false;
        state.booking = action.payload; // ✅ FIXED
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading.fetchOne = false;
        state.error.fetchOne = action.payload;
      })
      // ✏️ UPDATE BOOKING
      .addCase(updateBooking.pending, (state) => {
        state.loading.global = true;
        state.error.global = null;
      })
      .addCase(updateBooking.fulfilled, (state, { payload }) => {
        state.loading.global = false;
        state.success = "Booking updated successfully";

        // backend returns { updated }
        state.booking = payload.updated;
      })
      .addCase(updateBooking.rejected, (state, { payload }) => {
        state.loading.global = false;
        state.error.global = payload;

      });

  },
});

export const {
  clearErrorMessage,
  clearSuccessMessage,
  clearBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
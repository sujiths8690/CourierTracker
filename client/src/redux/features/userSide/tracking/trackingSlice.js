import { createSlice } from "@reduxjs/toolkit";
import {
  updateLocation,
  fetchCurrentLocation,
  fetchTrackingLogs,
} from "./trackingActions";

const initialState = {
  currentLocation: null,
  currentBookingId: null,
  logs: [], // ✅ ADD THIS
  loading: false,
  error: null,
  success: null,
};

const trackingSlice = createSlice({
  name: "tracking",
  initialState,

  reducers: {
    clearTrackingError: (state) => {
      state.error = null;
    },
    clearTrackingSuccess: (state) => {
      state.success = null;
    },
    clearTrackingData: (state) => {
      state.currentLocation = null;
      state.currentBookingId = null;
      state.logs = [];
      state.error = null;
      state.success = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // 📍 UPDATE LOCATION
      .addCase(updateLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLocation.fulfilled, (state) => {
        state.loading = false;
        state.success = "Location updated";
      })
      .addCase(updateLocation.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // 📡 FETCH CURRENT LOCATION
      .addCase(fetchCurrentLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentLocation.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentLocation = payload;
      })
      .addCase(fetchCurrentLocation.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchTrackingLogs.pending, (state, action) => {
        state.loading = true;
        const nextBookingId = action.meta.arg;

        if (state.currentBookingId !== nextBookingId) {
          state.currentBookingId = nextBookingId;
          state.logs = [];
        }
      })
      .addCase(fetchTrackingLogs.fulfilled, (state, action) => {
        state.loading = false;

        if (state.currentBookingId !== action.meta.arg) return;

        state.logs = action.payload; // ✅ THIS FILLS YOUR MAP DATA
      })
      .addCase(fetchTrackingLogs.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const {
  clearTrackingError,
  clearTrackingSuccess,
  clearTrackingData,
} = trackingSlice.actions;

export default trackingSlice.reducer;

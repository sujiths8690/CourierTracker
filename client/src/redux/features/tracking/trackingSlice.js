import { createSlice } from "@reduxjs/toolkit";
import {
  updateLocation,
  fetchCurrentLocation,
  fetchTrackingLogs,
} from "./trackingActions";

const initialState = {
  currentLocation: null,
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
      .addCase(fetchTrackingLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrackingLogs.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.logs = payload; // ✅ THIS FILLS YOUR MAP DATA
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
} = trackingSlice.actions;

export default trackingSlice.reducer;
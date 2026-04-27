import { createSlice } from "@reduxjs/toolkit";
import {
  createVehicle,
  fetchVehicles,
  fetchVehicleById,
  updateVehicle,
  deleteVehicle,
  fetchNearbyVehicles,
} from "./vehicleActions";

const initialState = {
  vehicles: [],
  selectedVehicle: null,
  nearbyVehicles: [],
  loading: false,
  error: null,
  success: null,
};

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,

  reducers: {
    clearSuccessMessage: (state) => {
      state.success = null;
    },
    clearErrorMessage: (state) => {
      state.error = null;
    },

    // 🔥 THIS WAS MISSING
    updateVehiclePosition: (state, action) => {
      const { vehicleId, lat, lng } = action.payload;

      // update main vehicle list
      const vehicle = state.vehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        vehicle.lastLat = lat;
        vehicle.lastLng = lng;
        vehicle.lastUpdated = new Date().toISOString();
      }

      // update nearby vehicles
      const nearby = state.nearbyVehicles.find(v => v.id === vehicleId);
      if (nearby) {
        nearby.lastLat = lat;
        nearby.lastLng = lng;
        nearby.lastUpdated = new Date().toISOString();
      }
    }
  },

  extraReducers: (builder) => {
    builder

      // ➕ CREATE
      .addCase(createVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVehicle.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = "Vehicle created successfully";
        state.vehicles.unshift(payload);
      })
      .addCase(createVehicle.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // 📥 FETCH ALL
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.vehicles = payload;
      })
      .addCase(fetchVehicles.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // 📄 FETCH SINGLE
      .addCase(fetchVehicleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedVehicle = payload;
      })
      .addCase(fetchVehicleById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // ✏️ UPDATE
      .addCase(updateVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVehicle.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = "Vehicle updated successfully";

        const index = state.vehicles.findIndex(
          (v) => v.id === payload.id
        );
        if (index !== -1) {
          state.vehicles[index] = payload;
        }
      })
      .addCase(updateVehicle.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // ❌ DELETE
      .addCase(deleteVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVehicle.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = payload.message;

        state.vehicles = state.vehicles.filter(
          (v) => v.id !== payload.id
        );
      })
      .addCase(deleteVehicle.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchNearbyVehicles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNearbyVehicles.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.nearbyVehicles = payload;
      })
      .addCase(fetchNearbyVehicles.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});
export const {
  clearErrorMessage,
  clearSuccessMessage,
  updateVehiclePosition   // 🔥 ADD THIS
} = vehicleSlice.actions;

export default vehicleSlice.reducer;
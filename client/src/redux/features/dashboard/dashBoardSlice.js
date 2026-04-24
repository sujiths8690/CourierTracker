import { createSlice } from "@reduxjs/toolkit";
import { fetchDashboard } from "./dashboardActions";

const initialState = {
  data: null,
  loading: false,
  error: null,
  success: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,

  reducers: {
    clearSuccessMessage: (state) => {
      state.success = null;
    },
    clearErrorMessage: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // 🔄 FETCH DASHBOARD
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchDashboard.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.data = payload;
        state.success = "Dashboard fetched successfully";
      })

      .addCase(fetchDashboard.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearErrorMessage, clearSuccessMessage } =
  dashboardSlice.actions;

export default dashboardSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";
import { loginDriver, logoutDriver } from "./authActions";

const getStoredDriver = () => {
  try {
    return JSON.parse(localStorage.getItem("driver"));
  } catch {
    return null;
  }
};

const initialState = {
  driver: getStoredDriver(),
  token: localStorage.getItem("driverToken") || null,
  isAuthenticated: !!localStorage.getItem("driverToken"),
  loading: false,
  error: null,
  success: null,
};

const driverAuthSlice = createSlice({
  name: "driverAuth",
  initialState,

  reducers: {
    clearDriverAuthError: (state) => {
      state.error = null;
    },
    clearDriverAuthSuccess: (state) => {
      state.success = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginDriver.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.driver = payload.driver;
        state.token = payload.token;
        state.isAuthenticated = true;
        state.success = "Login successful";
      })
      .addCase(loginDriver.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(logoutDriver.fulfilled, (state) => {
        state.driver = null;
        state.token = null;
        state.isAuthenticated = false;
        state.success = null;
        state.error = null;
      });
  },
});

export const { clearDriverAuthError, clearDriverAuthSuccess } =
  driverAuthSlice.actions;

export default driverAuthSlice.reducer;

import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../common/api";

export const loginDriver = createAsyncThunk(
  "driverAuth/login",
  async (data, thunkAPI) => {
    try {
      const response = await api.post("/auth/driver-login", data);

      if (response.data.token) {
        localStorage.setItem("driverToken", response.data.token);
      }

      if (response.data.driver) {
        localStorage.setItem("driver", JSON.stringify(response.data.driver));
      }

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Driver login failed"
      );
    }
  }
);

export const logoutDriver = createAsyncThunk(
  "driverAuth/logout",
  async () => {
    localStorage.removeItem("driverToken");
    localStorage.removeItem("driver");
    return true;
  }
);

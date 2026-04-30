import { createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../../../common/api";

// 🔥 Fetch Dashboard Data
export const fetchDashboard = createAsyncThunk(
  "dashboard/fetch",
  async (_, thunkAPI) => {
    try {
      const response = await API.get("/dashboard");
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard"
      );
    }
  }
);

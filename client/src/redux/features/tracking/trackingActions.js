import { createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../../common/api";

// 📍 UPDATE LOCATION (driver side)
export const updateLocation = createAsyncThunk(
  "tracking/updateLocation",
  async ({ id, lat, lng }, thunkAPI) => {
    try {
      const response = await API.patch(
        `/tracking/updateLocation/${id}`,
        { lat, lng }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Location update failed"
      );
    }
  }
);

// 📡 GET CURRENT LOCATION (user side)
export const fetchCurrentLocation = createAsyncThunk(
  "tracking/fetchCurrentLocation",
  async (id, thunkAPI) => {
    try {
      const response = await API.get(`/tracking/current/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Fetch location failed"
      );
    }
  }
);
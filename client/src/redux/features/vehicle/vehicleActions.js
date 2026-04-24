import { createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../../common/api";

// ➕ CREATE
export const createVehicle = createAsyncThunk(
  "vehicle/create",
  async (data, thunkAPI) => {
    try {
      const response = await API.post("/vehicle", data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Create failed"
      );
    }
  }
);

// 📥 GET ALL
export const fetchVehicles = createAsyncThunk(
  "vehicle/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await API.get("/vehicle");
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Fetch failed"
      );
    }
  }
);

export const fetchNearbyVehicles = createAsyncThunk(
  "vehicle/fetchNearby",
  async ({ lat, lng }, thunkAPI) => {
    try {
      const response = await API.get(
        `/vehicle/nearby?lat=${lat}&lng=${lng}`
      );

      return response.data.data;

    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Fetch failed"
      );
    }
  }
);

// 📄 GET SINGLE
export const fetchVehicleById = createAsyncThunk(
  "vehicle/fetchById",
  async (id, thunkAPI) => {
    try {
      const response = await API.get(`/vehicle/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Fetch failed"
      );
    }
  }
);

// ✏️ UPDATE
export const updateVehicle = createAsyncThunk(
  "vehicle/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await API.put(`/vehicle/${id}`, data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Update failed"
      );
    }
  }
);

// ❌ DELETE (soft)
export const deleteVehicle = createAsyncThunk(
  "vehicle/delete",
  async (id, thunkAPI) => {
    try {
      const response = await API.delete(`/vehicle/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Delete failed"
      );
    }
  }
);
import { createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../../common/api";

// ➕ CREATE BOOKING
export const createBooking = createAsyncThunk(
  "booking/create",
  async (data, thunkAPI) => {
    try {
      const response = await API.post("/booking/create", data);
      return response.data; // { booking, etaMinutes, distanceKm }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Booking creation failed"
      );
    }
  }
);

// 📄 GET BOOKING
export const fetchBooking = createAsyncThunk(
  "booking/fetch",
  async (id, thunkAPI) => {
    try {
      const response = await API.get(`/booking/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Fetch booking failed"
      );
    }
  }
);

/**
 * 🔍 FETCH BOOKING BY ID
 */
export const fetchBookingById = createAsyncThunk(
  "booking/fetchOne",
  async (id, thunkAPI) => {
    try {
      const response = await API.get(`/booking/${id}`);

      // 🔥 assuming backend returns: { message, data }
      return response.data.data;

    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch booking"
      );
    }
  }
);

// ✏️ UPDATE BOOKING
export const updateBooking = createAsyncThunk(
  "booking/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await API.put(`/booking/update/${id}`, data);
      return response.data; // { updated }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Update failed"
      );
    }
  }
);
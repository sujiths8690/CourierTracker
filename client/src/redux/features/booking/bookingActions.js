import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../common/api";

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

export const fetchBookings = createAsyncThunk(
  "booking/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/booking");

      // 🔥 IMPORTANT
      return response.data.data;

    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Fetch bookings failed"
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
      const response = await api.get(`/booking/${id}`);

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
      const response = await api.put(`/booking/update/${id}`, data);
      return response.data; // { updated }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Update failed"
      );
    }
  }
);
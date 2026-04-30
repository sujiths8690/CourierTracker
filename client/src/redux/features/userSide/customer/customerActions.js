import { createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../../../common/api";

// ➕ CREATE
export const createCustomer = createAsyncThunk(
  "customer/create",
  async (data, thunkAPI) => {
    try {
      const response = await API.post("/customer", data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Create failed"
      );
    }
  }
);

// 📥 GET ALL
export const fetchCustomers = createAsyncThunk(
  "customer/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await API.get("/customer");

      // ✅ FIX HERE
      return response.data.data;

    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Fetch failed"
      );
    }
  }
);

// 📄 GET SINGLE
export const fetchCustomerById = createAsyncThunk(
  "customer/fetchById",
  async (id, thunkAPI) => {
    try {
      const response = await API.get(`/customer/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Fetch failed"
      );
    }
  }
);

// ✏️ UPDATE
export const updateCustomer = createAsyncThunk(
  "customer/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await API.put(`/customer/${id}`, data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Update failed"
      );
    }
  }
);

// ❌ DELETE (soft delete)
export const deleteCustomer = createAsyncThunk(
  "customer/delete",
  async (id, thunkAPI) => {
    try {
      const response = await API.delete(`/customer/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Delete failed"
      );
    }
  }
);

import { createSlice } from "@reduxjs/toolkit";
import {
  createCustomer,
  fetchCustomers,
  fetchCustomerById,
  updateCustomer,
  deleteCustomer,
} from "./customerActions";

const initialState = {
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null,
  success: null,
};

const customerSlice = createSlice({
  name: "customer",
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

      // ➕ CREATE
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = "Customer created successfully";

        // ✅ FIX HERE
        state.customers.unshift(payload.data);
        })
      .addCase(createCustomer.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // 📥 FETCH ALL
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.customers = payload;
      })
      .addCase(fetchCustomers.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // 📄 FETCH SINGLE
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedCustomer = payload;
      })
      .addCase(fetchCustomerById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // ✏️ UPDATE
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = "Customer updated successfully";

        const index = state.customers.findIndex(
          (c) => c.id === payload.id
        );
        if (index !== -1) {
          state.customers[index] = payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // ❌ DELETE (soft)
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = payload.message;

        state.customers = state.customers.filter(
          (c) => c.id !== payload.id
        );
      })
      .addCase(deleteCustomer.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearErrorMessage, clearSuccessMessage } =
  customerSlice.actions;

export default customerSlice.reducer;
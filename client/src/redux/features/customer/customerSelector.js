export const selectCustomerLoading = (state) => state.customer.loading;
export const selectCustomerError = (state) => state.customer.error;
export const selectCustomerSuccess = (state) => state.customer.success;

export const selectCustomers = (state) => state.customer.customers;
export const selectSelectedCustomer = (state) =>
  state.customer.selectedCustomer;
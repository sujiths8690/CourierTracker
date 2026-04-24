import { configureStore } from "@reduxjs/toolkit";

import customerReducer from "./features/customer/customerSlice";
import vehicleReducer from "./features/vehicle/vehicleSlice";
import bookingReducer from "./features/booking/bookingSlice";
import dashboardReducer from "./features/dashboard/dashBoardSlice";
import trackingReducer from "./features/tracking/trackingSlice";
import authReducer from "./features/auth/authSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    customer: customerReducer,
    vehicle: vehicleReducer,
    booking: bookingReducer,
    tracking: trackingReducer,
  },
});

export default store;
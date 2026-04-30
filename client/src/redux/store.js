import { configureStore } from "@reduxjs/toolkit";

import customerReducer from "./features/userSide/customer/customerSlice";
import vehicleReducer from "./features/userSide/vehicle/vehicleSlice";
import bookingReducer from "./features/userSide/booking/bookingSlice";
import dashboardReducer from "./features/userSide/dashboard/dashBoardSlice";
import trackingReducer from "./features/userSide/tracking/trackingSlice";
import authReducer from "./features/userSide/auth/authSlice";
import driverAuthReducer from "./features/driverSide/auth/authSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    driverAuth: driverAuthReducer,
    dashboard: dashboardReducer,
    customer: customerReducer,
    vehicle: vehicleReducer,
    booking: bookingReducer,
    tracking: trackingReducer,
  },
});

export default store;

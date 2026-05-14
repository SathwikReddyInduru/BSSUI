import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "./slices/auth/authSlice";
import networkListReducer from "./slices/networkListSlice";
import networkStatusReducer from "./slices/networkStatusSlice";

const rootReducer = combineReducers({
    auth: authReducer,

    networkList: networkListReducer,
    networkStatus: networkStatusReducer,
});

export default rootReducer;
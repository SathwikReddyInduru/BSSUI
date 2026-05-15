import { combineReducers } from "@reduxjs/toolkit";

// AUTH
import authReducer from "./slices/auth/authSlice";

// NETWORK
import countriesReducer from "./slices/countriesSlice";
import statesReducer from "./slices/statesSlice";

import networkListReducer from "./slices/networkListSlice";
import networkStatusReducer from "./slices/networkStatusSlice";
import networkDetailsReducer from "./slices/networkDetailsSlice";
import networkModificationReducer from "./slices/networkModificationSlice";
import networkConfigSubmitReducer from "./slices/networkConfigSubmitSlice";
import changePasswordReducer from "./slices/updatePassword";
import networkConfigReducer from "./slices/networkConfigSlice";
import networkCreationReducer from "./slices/networkCreationSlice";

// USER MANAGEMENT
import userListReducer from "./slices/userManagementSlices/userListSlice";
import roleDetailsReducer from "./slices/userManagementSlices/roleDetailsSlice";
import rolesReducer from "./slices/userManagementSlices/rolesSlice";
import createRoleReducer from "./slices/userManagementSlices/createRoleSlice";
import modifyRoleReducer from "./slices/userManagementSlices/modifyRoleSlice";
import privilegesReducer from "./slices/userManagementSlices/privilegesSlice";
import roleDeleteReducer from "./slices/userManagementSlices/roleDeleteSlice";
import rolePrivilegesReducer from "./slices/userManagementSlices/rolePrivileges";
import userRolesReducer from "./slices/userManagementSlices/userRolesSlice";
import workgroupReducer from "./slices/userManagementSlices/workgroupSlice";
import viewUserInfoReducer from './slices/userManagementSlices/viewUserInfoSlice';

const rootReducer = combineReducers({
    // AUTH
    auth: authReducer,

    // NETWORK
    countries: countriesReducer,
    states: statesReducer,

    networkCreation: networkCreationReducer,
    networkList: networkListReducer,
    networkStatus: networkStatusReducer,
    networkDetails: networkDetailsReducer,
    networkModification: networkModificationReducer,
    changePassword: changePasswordReducer,
    networkConfig: networkConfigReducer,
    networkConfigSubmit: networkConfigSubmitReducer,

    // USER MANAGEMENT
    userList: userListReducer,
    roleDetails: roleDetailsReducer,
    roles: rolesReducer,
    createRole: createRoleReducer,
    modifyRole: modifyRoleReducer,
    privileges: privilegesReducer,
    roleDelete: roleDeleteReducer,
    rolePrivileges: rolePrivilegesReducer,
    userRoles: userRolesReducer,
    workgroup: workgroupReducer,
    viewUserInfo: viewUserInfoReducer
});

export default rootReducer;
// import {
//     BrowserRouter,
//     Routes,
//     Route,
//     Navigate,
// } from "react-router-dom";

// import { useSelector } from "react-redux";

// import HomeLayout from "../layouts/HomeLayout";
// import ModuleLayout from "../layouts/ModuleLayout";
// import AuthLayout from "../layouts/AuthLayout";
// import AdminLayout from "../layouts/AdminLayout";

// import Home from "../modules/home/pages/Home";
// import Login from "../modules/auth/pages/Login";
// import { ToastContainer } from "react-toastify";

// /* =========================
//    NETWORK MANAGEMENT SCREENS
// ========================= */

// import NetworkManagementGrid from "../screens/NetworkManagementGrid";
// import NetworkManagement from "../screens/NetworkManagement";
// import NetworkManagementModify from "../screens/NetworkManagementModify";
// import NetworkView from "../screens/NetworkView";
// import NetworkChangePassword from "../screens/NetworkChangePassword";
// import NetworkConfigure from "../screens/NetworkConfigure";
// import NetworkMessagePage from "../screens/Networkstatus";
// import NetworkStatusCode from "../screens/NetworkStatusCode";
// import NetworkStatusModify from "../screens/NetworkStatusModify";

// /* =========================
//    ADMIN ROUTE
// ========================= */

// const AdminRoute = ({ children }) => {

//     const {
//         isAuthenticated,
//         user,
//     } = useSelector((state) => state.auth);

//     // NOT LOGGED IN

//     if (!isAuthenticated) {
//         return <Navigate to="/login" replace />;
//     }

//     // NORMAL USER TRYING ADMIN

//     if (user?.networkId !== 0) {
//         return <Navigate to="/home" replace />;
//     }

//     return children;
// };

// /* =========================
//    USER ROUTE
// ========================= */

// const UserRoute = ({ children }) => {

//     const {
//         isAuthenticated,
//         user,
//     } = useSelector((state) => state.auth);

//     // NOT LOGGED IN

//     if (!isAuthenticated) {
//         return <Navigate to="/login" replace />;
//     }

//     // ADMIN TRYING USER ROUTES

//     if (user?.networkId === 0) {
//         return <Navigate to="/admin" replace />;
//     }

//     return children;
// };

// function AppRoutes() {

//     const {
//         isAuthenticated,
//         user,
//     } = useSelector((state) => state.auth);

//     const isAdmin =
//         user?.networkId === 0;

//     return (

//         <BrowserRouter>

//             <Routes>

//                 {/* DEFAULT */}

//                 <Route
//                     path="/"
//                     element={
//                         isAuthenticated ? (
//                             isAdmin
//                                 ? <Navigate to="/admin" replace />
//                                 : <Navigate to="/home" replace />
//                         ) : (
//                             <Navigate to="/login" replace />
//                         )
//                     }
//                 />

//                 {/* LOGIN */}

//                 <Route element={<AuthLayout />}>

//                     <Route
//                         path="/login"
//                         element={
//                             isAuthenticated ? (
//                                 isAdmin
//                                     ? <Navigate to="/admin" replace />
//                                     : <Navigate to="/home" replace />
//                             ) : (
//                                 <Login />
//                             )
//                         }
//                     />

//                 </Route>

//                 {/* ADMIN ROUTES */}

//                 <Route
//                     path="/admin"
//                     element={
//                         <AdminRoute>
//                             <AdminLayout />
//                         </AdminRoute>
//                     }
//                 >

//                     {/* DEFAULT ADMIN PAGE */}

//                     <Route
//                         index
//                         element={<NetworkManagementGrid />}
//                     />

//                     {/* NETWORK MANAGEMENT */}

//                     <Route
//                         path="networkmanagementgrid"
//                         element={<NetworkManagementGrid />}
//                     />

//                     <Route
//                         path="networkmanagement"
//                         element={<NetworkManagement />}
//                     />

//                     <Route
//                         path="networkmanagementmodify/:networkId"
//                         element={<NetworkManagementModify />}
//                     />

//                     <Route
//                         path="network-view/:networkId"
//                         element={<NetworkView />}
//                     />

//                     <Route
//                         path="networkchangepassword/:networkId"
//                         element={<NetworkChangePassword />}
//                     />

//                     <Route
//                         path="network-configure/:networkId/:networkName"
//                         element={<NetworkConfigure />}
//                     />

//                     {/* STATUS / RESULT SCREENS */}

//                     <Route
//                         path="network-status"
//                         element={<NetworkMessagePage />}
//                     />

//                     <Route
//                         path="network-status-code"
//                         element={<NetworkStatusCode />}
//                     />

//                     <Route
//                         path="network-statusmodify"
//                         element={<NetworkStatusModify />}
//                     />

//                 </Route>

//                 {/* USER HOME */}

//                 <Route
//                     element={
//                         <UserRoute>
//                             <HomeLayout />
//                         </UserRoute>
//                     }
//                 >

//                     <Route
//                         path="/home"
//                         element={<Home />}
//                     />

//                 </Route>

//                 {/* USER MODULES */}

//                 <Route
//                     element={
//                         <UserRoute>
//                             <ModuleLayout />
//                         </UserRoute>
//                     }
//                 >

//                     <Route
//                         path="/plmn"
//                         element={<div>PLMN</div>}
//                     />

//                 </Route>

//                 {/* FALLBACK */}

//                 <Route
//                     path="*"
//                     element={
//                         <Navigate
//                             to={
//                                 isAuthenticated
//                                     ? (
//                                         isAdmin
//                                             ? "/admin"
//                                             : "/home"
//                                     )
//                                     : "/login"
//                             }
//                             replace
//                         />
//                     }
//                 />

//             </Routes>

//             <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         closeOnClick
//         pauseOnHover
//         draggable
//         theme="colored"
//       />

//         </BrowserRouter>
//     );
// }

// export default AppRoutes;


import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";
import HomeLayout from "../layouts/HomeLayout";
import ModuleLayout from "../layouts/ModuleLayout";

import Login from "../modules/auth/pages/Login";
import Home from "../modules/home/pages/Home";

import { ToastContainer } from "react-toastify";

/* =========================
   NETWORK MANAGEMENT SCREENS
========================= */

import NetworkChangePassword from "../screens/NetworkChangePassword";
import NetworkConfigure from "../screens/NetworkConfigure";
import NetworkManagement from "../screens/NetworkManagement";
import NetworkManagementGrid from "../screens/NetworkManagementGrid";
import NetworkManagementModify from "../screens/NetworkManagementModify";
import NetworkMessagePage from "../screens/Networkstatus";
import NetworkStatusCode from "../screens/NetworkStatusCode";
import NetworkStatusModify from "../screens/NetworkStatusModify";
import NetworkView from "../screens/NetworkView";

/* =========================
   USER MANAGEMENT SCREENS
========================= */

import CreateRole from "../modules/userManagement/pages/CreateRole";
import ModifyRole from "../modules/userManagement/pages/ModifyRole";
import ModifyUserInfo from "../modules/userManagement/pages/ModifyUserInfo";
import RoleCreationStatus from "../modules/userManagement/pages/RoleCreationStatus";
import RoleManagement from "../modules/userManagement/pages/RoleManagement";
import RoleModifyStatus from "../modules/userManagement/pages/RoleModifyStatus";
import UserManagementGrid from "../modules/userManagement/pages/UserManagementGrid";
import UserManagementScreen from "../modules/userManagement/pages/UserManagementScreen";
import ViewRole from "../modules/userManagement/pages/ViewRole";
import ViewUserInfoPage from "../modules/userManagement/pages/ViewUserInfoPage";
import ChangePassword from './../modules/userManagement/pages/ChangePassword';
import ModifyMessagePage from './../modules/userManagement/pages/ModifyMessagePage';
import StatusMessagePage from './../modules/userManagement/pages/StatusMessagePage';

/* =========================
   ADMIN ROUTE
========================= */

const AdminRoute = ({ children }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.networkId !== 0) return <Navigate to="/home" replace />;

    return children;
};

/* =========================
   USER ROUTE
========================= */

const UserRoute = ({ children }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.networkId === 0) return <Navigate to="/admin" replace />;

    return children;
};

/* =========================
   PLACEHOLDER PAGE
========================= */

const PlaceholderPage = ({ title }) => (
    <div style={{ padding: "32px 28px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: 8 }}>
            {title}
        </h2>

        <p style={{ fontSize: "13px", color: "#6b7280" }}>
            This section is under construction.
        </p>
    </div>
);

function AppRoutes() {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const isAdmin = user?.networkId === 0;

    return (
        <BrowserRouter>

            <Routes>

                {/* DEFAULT */}

                <Route
                    path="/"
                    element={
                        isAuthenticated
                            ? (isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/home" replace />)
                            : <Navigate to="/login" replace />
                    }
                />

                {/* LOGIN */}

                <Route element={<AuthLayout />}>
                    <Route
                        path="/login"
                        element={
                            isAuthenticated
                                ? (isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/home" replace />)
                                : <Login />
                        }
                    />
                </Route>

                {/* ADMIN ROUTES */}

                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>

                    <Route index element={<NetworkManagementGrid />} />

                    <Route path="networkmanagementgrid" element={<NetworkManagementGrid />} />
                    <Route path="networkmanagement" element={<NetworkManagement />} />
                    <Route path="networkmanagementmodify/:networkId" element={<NetworkManagementModify />} />
                    <Route path="network-view/:networkId" element={<NetworkView />} />
                    <Route path="networkchangepassword/:networkId" element={<NetworkChangePassword />} />
                    <Route path="network-configure/:networkId/:networkName" element={<NetworkConfigure />} />

                    <Route path="network-status" element={<NetworkMessagePage />} />
                    <Route path="network-status-code" element={<NetworkStatusCode />} />
                    <Route path="network-statusmodify" element={<NetworkStatusModify />} />

                </Route>

                {/* USER HOME */}

                <Route element={<UserRoute><HomeLayout /></UserRoute>}>
                    <Route path="/home" element={<Home />} />
                </Route>

                {/* USER MODULES */}

                <Route element={<UserRoute><ModuleLayout /></UserRoute>}>

                    {/* PLMN */}

                    <Route path="/plmn" element={<Navigate to="/plmn/clc" replace />} />
                    <Route path="/plmn/clc" element={<Navigate to="/plmn/clc/card-voucher-profile-categories" replace />} />

                    <Route path="/plmn/clc/card-voucher-profile-categories" element={<div>Static Div</div>} />
                    <Route path="/plmn/clc/card-profile" element={<PlaceholderPage title="Card Profile" />} />
                    <Route path="/plmn/clc/vouchers" element={<PlaceholderPage title="Vouchers" />} />

                    {/* CMS */}

                    <Route path="/plmn/cms" element={<Navigate to="/plmn/cms/card-voucher-profile-categories" replace />} />
                    <Route path="/plmn/cms/card-voucher-profile-categories" element={<PlaceholderPage title="Card Voucher Profile Categories" />} />
                    <Route path="/plmn/cms/card-profile" element={<PlaceholderPage title="Card Profile" />} />
                    <Route path="/plmn/cms/vouchers" element={<PlaceholderPage title="Vouchers" />} />
                    <Route path="/plmn/cms/goods-receipts" element={<PlaceholderPage title="Goods Receipts" />} />
                    <Route path="/plmn/cms/vendor-details" element={<PlaceholderPage title="Vendor Details" />} />
                    <Route path="/plmn/cms/upload-msisdn" element={<PlaceholderPage title="Upload MSISDN" />} />
                    <Route path="/plmn/cms/manage-inventory-type" element={<PlaceholderPage title="Manage Inventory Type" />} />
                    <Route path="/plmn/cms/inventory-upload" element={<PlaceholderPage title="Inventory Upload" />} />
                    <Route path="/plmn/cms/upload-puk" element={<PlaceholderPage title="Upload PUK" />} />
                    <Route path="/plmn/cms/inventory-approve" element={<PlaceholderPage title="Inventory Approve" />} />
                    <Route path="/plmn/cms/inventory-status" element={<PlaceholderPage title="Inventory Status" />} />
                    <Route path="/plmn/cms/extract-sim-details" element={<PlaceholderPage title="Extract SIM Details" />} />
                    <Route path="/plmn/cms/triplet-association" element={<PlaceholderPage title="Triplet Association" />} />
                    <Route path="/plmn/cms/triplet-association-view" element={<PlaceholderPage title="Triplet Association View" />} />
                    <Route path="/plmn/cms/location-bulk-upload" element={<PlaceholderPage title="Location Bulk Upload" />} />
                    <Route path="/plmn/cms/upload-fancy-msisdn" element={<PlaceholderPage title="Upload Fancy MSISDN" />} />

                    {/* TSG */}

                    <Route path="/plmn/tsg" element={<Navigate to="/plmn/tsg/circle-operator-prefix" replace />} />
                    <Route path="/plmn/tsg/circle-operator-prefix" element={<PlaceholderPage title="Circle Operator Prefix" />} />
                    <Route path="/plmn/tsg/free-numbers" element={<PlaceholderPage title="Free Numbers" />} />
                    <Route path="/plmn/tsg/local-codes" element={<PlaceholderPage title="Local Codes" />} />
                    <Route path="/plmn/tsg/location-details" element={<PlaceholderPage title="Location Details" />} />
                    <Route path="/plmn/tsg/network-details" element={<PlaceholderPage title="Network Details" />} />
                    <Route path="/plmn/tsg/semi-local-codes" element={<PlaceholderPage title="Semi Local Codes" />} />
                    <Route path="/plmn/tsg/service-numbers" element={<PlaceholderPage title="Service Numbers" />} />
                    <Route path="/plmn/tsg/switch-details" element={<PlaceholderPage title="Switch Details" />} />
                    <Route path="/plmn/tsg/telecom-prefix-details" element={<PlaceholderPage title="Telecom Prefix Details" />} />
                    <Route path="/plmn/tsg/toll-free" element={<PlaceholderPage title="Toll Free" />} />
                    <Route path="/plmn/tsg/configure-thresholds" element={<PlaceholderPage title="Configure Thresholds" />} />
                    <Route path="/plmn/tsg/upload-mscids" element={<PlaceholderPage title="Upload MSCIds" />} />
                    <Route path="/plmn/tsg/ndc-msisdn-mapping" element={<PlaceholderPage title="NDC MSISDN Mapping" />} />

                    {/* BILLING */}

                    <Route path="/billing" element={<Navigate to="/billing/rat" replace />} />
                    <Route path="/billing/rat" element={<PlaceholderPage title="Rating & Billing" />} />
                    <Route path="/billing/set" element={<PlaceholderPage title="Settlements" />} />
                    <Route path="/billing/cfg" element={<PlaceholderPage title="Configuration" />} />

                    {/* UMS */}

                    <Route path="/ums" element={<Navigate to="/ums/users" replace />} />
                    <Route path="/ums/users" element={<UserManagementGrid />} />
                    <Route path="/ums/create-user" element={<UserManagementScreen />} />
                    <Route path="/ums/modify-user/:id" element={<ModifyUserInfo />} />
                    <Route path="/ums/view-user/:id" element={<ViewUserInfoPage />} />
                    <Route path="/ums/roles" element={<RoleManagement />} />
                    <Route path="/ums/create-role" element={<CreateRole />} />
                    <Route path="/ums/modify-role/:id" element={<ModifyRole />} />
                    <Route path="/ums/view-role/:id" element={<ViewRole />} />
                    <Route path="/ums/role-create-status" element={<RoleCreationStatus />} />
                    <Route path="/ums/role-modify-status" element={<RoleModifyStatus />} />
                    <Route path="/ums/changepassword/:loginName" element={<ChangePassword />} />
                    <Route path="/modify-message" element={<ModifyMessagePage />} />
                    <Route path="/status-message" element={<StatusMessagePage />} />

                    {/* ICB */}

                    <Route path="/icb" element={<Navigate to="/icb/main" replace />} />
                    <Route path="/icb/main" element={<PlaceholderPage title="InterConnect Billing" />} />

                    {/* TMS */}

                    <Route path="/tms" element={<Navigate to="/tms/main" replace />} />
                    <Route path="/tms/main" element={<PlaceholderPage title="Trouble Ticket Management" />} />

                    {/* RMS */}

                    <Route path="/rms" element={<Navigate to="/rms/main" replace />} />
                    <Route path="/rms/main" element={<PlaceholderPage title="Roaming Management Server" />} />
                    <Route path="/rms/mnp" element={<PlaceholderPage title="Mobile Number Portability" />} />
                    <Route path="/rms/wnf" element={<PlaceholderPage title="Welcome Notification" />} />

                </Route>

                {/* FALLBACK */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to={
                                isAuthenticated
                                    ? (isAdmin ? "/admin" : "/home")
                                    : "/login"
                            }
                            replace
                        />
                    }
                />

            </Routes>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                draggable
                theme="colored"
            />

        </BrowserRouter>
    );
}

export default AppRoutes;
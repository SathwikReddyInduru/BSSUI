import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HomeLayout from "../layouts/HomeLayout";
import ModuleLayout from "../layouts/ModuleLayout";
import AuthLayout from "../layouts/AuthLayout";
import Home from "../modules/home/pages/Home";
import Login from "../modules/auth/pages/Login";
import Sidebar from "../components/common/Sidebar";

// PROTECTED ROUTE
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Generic placeholder page for sub-routes
const PlaceholderPage = ({ title }) => (
    <div style={{ padding: "32px 28px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: 8 }}>{title}</h2>
        <p style={{ fontSize: "13px", color: "#6b7280" }}>This section is under construction.</p>
    </div>
);

function AppRoutes() {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <BrowserRouter>
            <Routes>
                {/* DEFAULT */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/home" replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* AUTH */}
                <Route element={<AuthLayout />}>
                    <Route
                        path="/login"
                        element={
                            isAuthenticated ? <Navigate to="/home" replace /> : <Login />
                        }
                    />
                </Route>

                {/* HOME */}
                <Route
                    element={
                        <ProtectedRoute>
                            <HomeLayout />
                        </ProtectedRoute>
                    } >
                    <Route path="/home" element={<Home />} />
                </Route>

                {/* MODULES */}
                <Route
                    element={
                        <ProtectedRoute>
                            <ModuleLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* ── PLMN ── */}
                    <Route path="/plmn" element={<Navigate to="/plmn/clc" replace />} />
                    <Route path="/plmn/clc" element={<Navigate to="/plmn/clc/card-voucher-profile-categories" replace />} />
                    <Route path="/plmn/clc/card-voucher-profile-categories" element={<Sidebar />} />
                    <Route path="/plmn/clc/card-profile" element={<PlaceholderPage title="Card Profile" />} />
                    <Route path="/plmn/clc/vouchers" element={<PlaceholderPage title="Vouchers" />} />

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

                    {/* ── Billing ── */}
                    <Route path="/billing" element={<Navigate to="/billing/rat" replace />} />
                    <Route path="/billing/rat" element={<PlaceholderPage title="Rating & Billing" />} />
                    <Route path="/billing/set" element={<PlaceholderPage title="Settlements" />} />
                    <Route path="/billing/cfg" element={<PlaceholderPage title="Configuration" />} />

                    {/* ── UMS ── */}
                    <Route path="/ums" element={<Navigate to="/ums/main" replace />} />
                    <Route path="/ums/main" element={<PlaceholderPage title="User Management System" />} />

                    {/* ── ICB ── */}
                    <Route path="/icb" element={<Navigate to="/icb/main" replace />} />
                    <Route path="/icb/main" element={<PlaceholderPage title="InterConnect Billing" />} />

                    {/* ── TMS ── */}
                    <Route path="/tms" element={<Navigate to="/tms/main" replace />} />
                    <Route path="/tms/main" element={<PlaceholderPage title="Trouble Ticket Management" />} />

                    {/* ── RMS ── */}
                    <Route path="/rms" element={<Navigate to="/rms/main" replace />} />
                    <Route path="/rms/main" element={<PlaceholderPage title="Roaming Management Server" />} />
                    <Route path="/rms/mnp" element={<PlaceholderPage title="Mobile Number Portability" />} />
                    <Route path="/rms/wnf" element={<PlaceholderPage title="Welcome Notification" />} />
                </Route>

                {/* FALLBACK */}
                <Route
                    path="*"
                    element={
                        <Navigate to={isAuthenticated ? "/home" : "/login"} replace />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
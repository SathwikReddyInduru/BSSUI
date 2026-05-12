import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomeLayout from "../layouts/HomeLayout";
import ModuleLayout from "../layouts/ModuleLayout";
import Home from "../modules/home/pages/Home";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../modules/auth/pages/Login";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                </Route>

                {/* HOME PAGE */}
                <Route element={<HomeLayout />}>
                    <Route
                        path="/home"
                        element={<Home />}
                    />
                </Route>

                {/* MODULE PAGES */}
                <Route element={<ModuleLayout />}>
                    <Route
                        path="/plmn"
                        element={<div>PLMN</div>}
                    />
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HomeLayout from "../layouts/HomeLayout";
import ModuleLayout from "../layouts/ModuleLayout";
import AuthLayout from "../layouts/AuthLayout";
import Home from "../modules/home/pages/Home";
import Login from "../modules/auth/pages/Login";

// PROTECTED ROUTE
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

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
                    <Route path="/plmn" element={<div>PLMN</div>} />
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
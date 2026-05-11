import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<div>Login</div>} />

                <Route element={<AppLayout />}>
                    <Route
                        path="/dashboard"
                        element={<div>Dashboard</div>}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
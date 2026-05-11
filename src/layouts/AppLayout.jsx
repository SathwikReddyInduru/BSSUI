import { Outlet } from "react-router-dom";

import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import Sidebar from "../components/common/Sidebar";

function AppLayout() {
    return (
        <>
            <Header />

            <div className="app-layout">
                <Sidebar />

                <main className="main-content">
                    <Outlet />
                </main>
            </div>

            <Footer />
        </>
    );
}

export default AppLayout;
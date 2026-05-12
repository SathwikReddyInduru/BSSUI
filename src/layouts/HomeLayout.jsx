import { Outlet } from "react-router-dom";

import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

function HomeLayout() {
    return (
        <div className="layout">
            <Header />

            <main className="main-content">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}

export default HomeLayout;
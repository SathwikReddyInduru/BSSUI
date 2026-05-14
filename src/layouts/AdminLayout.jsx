import { Outlet, useNavigate, useLocation } from "react-router-dom";

import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

import styles from "../styles/Layout.module.css";

function AdminLayout() {

    const navigate = useNavigate();

    const location = useLocation();

    return (

        <div className={styles.adminLayout}>

            {/* Header */}
            <Header />

            {/* Main Layout */}
            <div className={styles.adminBody}>

                {/* Sidebar */}
                <aside className={styles.adminSidebar}>

                    <nav className={styles.sidebarMenu}>

                        <ul>

                            <li
                                className={
                                    location.pathname.includes("/network")
                                        ? styles.active
                                        : ""
                                }
                                onClick={() =>
                                    navigate("/networkmanagementgrid")
                                }
                            >

                                <span className={styles.menuIcon}>
                                    🌐
                                </span>

                                <span>
                                    Network Management
                                </span>

                            </li>

                        </ul>

                    </nav>

                </aside>

                {/* Content Area */}
                <main className={styles.adminContent}>

                    <div className={styles.contentWrapper}>

                        <Outlet />

                    </div>

                </main>

            </div>

            {/* Footer */}
            <Footer />

        </div>
    );
}

export default AdminLayout;
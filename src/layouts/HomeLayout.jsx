import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import styles from "../styles/Layout.module.css";

function HomeLayout() {
    return (
        <div className={styles.layout}>
            <Header />
            <main className={styles.mainContent}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default HomeLayout;
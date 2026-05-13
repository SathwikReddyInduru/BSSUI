import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import styles from "../styles/Layout.module.css";

function AuthLayout() {
    return (
        <div className={styles.layout}>
            <Header />
            <main className={styles.authMain}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default AuthLayout;
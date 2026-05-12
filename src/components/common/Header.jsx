import React from "react";
import styles from "../../styles/Header.module.css";
import xiusLogo from "../../assets/xius_logo.png";

const Header = () => {
    return (
        <header className={styles.appHeader}>

            <div className={styles.headerLeft}>
                <img
                    src={xiusLogo}
                    alt="XIUS Logo"
                    className={styles.headerLogo}
                />
            </div>

            <div className={styles.headerTitle}>
                <h2>Xius Operation Management</h2>
            </div>



        </header>
    );
};

export default Header;
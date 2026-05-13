import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Menu, Home, LogOut } from "lucide-react";
import styles from "../../styles/Header.module.css";
import xiusLogo from "../../assets/xius_logo.png";
import { logout } from "../../store/slices/auth/authSlice";
const Header = () => {

    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const [menuOpen, setMenuOpen] =
        useState(false);

    const [currentTime, setCurrentTime] =
        useState(new Date());

    // LIVE TIMER
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // CLOSE DROPDOWN ON OUTSIDE CLICK
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // LOGIN PAGE TITLE ONLY
    const { isAuthenticated } =
        useSelector(
            (state) => state.auth
        );

    const dispatch = useDispatch();

    // DATE & TIME FORMAT
    const formattedTime = currentTime.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    const handleHome = () => {
        navigate("/home");
        setMenuOpen(false);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
        setMenuOpen(false);
    };
    return (

        <header className={styles.appHeader}>

            {/* LEFT */}
            <div className={styles.headerLeft}>

                <img
                    src={xiusLogo}
                    alt="XIUS Logo"
                    className={styles.headerLogo} />
            </div>

            {/* TITLE */}
            {!isAuthenticated && (

                <div className={styles.headerTitle}>
                    <h2>
                        Xius Operation Management
                    </h2>
                </div>
            )}

            {/* RIGHT */}
            {isAuthenticated && (
                <div className={styles.headerRight}>

                    {/* TIMER */}
                    <div className={styles.timerContainer}>

                        {formattedTime}

                    </div>

                    {/* MENU */}
                    <div
                        className={styles.menuWrapper}
                        ref={dropdownRef} >
                        <button
                            className={styles.menuButton}
                            onClick={() =>
                                setMenuOpen(!menuOpen)
                            } >
                            <Menu size={22} />

                        </button>

                        {menuOpen && (
                            <div className={styles.dropdownMenu}>

                                <button
                                    className={styles.dropdownItem}
                                    onClick={handleHome} >

                                    <Home size={18} />
                                    <span>Home</span>

                                </button>

                                <button
                                    className={styles.dropdownItem}
                                    onClick={handleLogout}>

                                    <LogOut size={18} />
                                    <span>Logout</span>

                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
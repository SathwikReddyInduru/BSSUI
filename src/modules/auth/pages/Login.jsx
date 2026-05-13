import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector, } from "react-redux";
import styles from "../styles/Login.module.css";
import { loginUser, clearError, } from "../../../store/slices/auth/authSlice";

function Login() {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error, } = useSelector((state) => state.auth);

    const [isAdmin, setIsAdmin] = useState(false);
    const [networkName, setNetworkName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // TOGGLE ADMIN / USER
    const handleToggle = () => {

        setIsAdmin((prev) => !prev);
        setNetworkName("");
        setUsername("");
        setPassword("");
        dispatch(clearError());
    };

    // CANCEL
    const handleCancel = () => {

        setNetworkName("");
        setUsername("");
        setPassword("");
        dispatch(clearError());
        setIsAdmin(true);
    };

    // LOGIN
    const handleLogin = async (e) => {

        e.preventDefault();
        dispatch(clearError());

        if (!username.trim() || !password.trim()) {
            return;
        }

        if (!isAdmin && !networkName.trim()) {
            return;
        }

        const result = await dispatch(
            loginUser({
                networkName: isAdmin
                    ? null
                    : networkName,

                username,
                password,
            })
        );

        if (loginUser.fulfilled.match(result)) {
            navigate("/home");
        }
    };

    return (

        <div className={styles.card}>

            {/* Card Header */}
            <div className={styles.cardHeader}>

                <div className={styles.iconWrapper}>
                    <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M18 8H20C21.1046 8 22 8.89543 22 10V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20V10C2 8.89543 2.89543 8 4 8H6V7C6 4.23858 8.23858 2 11 2H13C15.7614 2 18 4.23858 18 7V8ZM16 8V7C16 5.34315 14.6569 4 13 4H11C9.34315 4 8 5.34315 8 7V8H16ZM12 14C13.1046 14 14 14.8954 14 16C14 17.1046 13.1046 18 12 18C10.8954 18 10 17.1046 10 16C10 14.8954 10.8954 14 12 14Z"
                            fill="currentColor"
                        />
                    </svg>
                </div>

                <p className={styles.subtitle}>
                    Enter your credentials
                    to access the system
                </p>

            </div>

            {/* Toggle */}
            <div className={styles.toggleRow}>

                <span
                    className={`${styles.modeText} ${isAdmin
                        ? styles.modeTextAdmin
                        : styles.modeTextUser
                        }`}
                >
                    {isAdmin ? "Admin" : "User"}
                </span>

                <div
                    className={`${styles.iosSwitch} ${isAdmin
                        ? styles.iosSwitchOn
                        : ""
                        }`}
                    onClick={handleToggle}
                    role="switch"
                    aria-checked={isAdmin}
                    tabIndex={0}
                >
                    <div className={styles.iosKnob} />
                </div>

            </div>

            {/* Error */}
            {error && (
                <div className={styles.errorBanner}>

                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                            fill="currentColor"
                        />
                    </svg>

                    {error.message || "Login failed"}

                </div>
            )}

            {/* Form */}
            <form
                onSubmit={handleLogin}
                className={styles.form}
            >

                {/* Network Name */}
                {!isAdmin && (
                    <div className={styles.formGroup}>

                        <label
                            htmlFor="networkName"
                            className={styles.label}
                        >
                            Network Name
                            <span className={styles.required}>
                                *
                            </span>
                        </label>

                        <div className={styles.inputWrapper}>

                            <input
                                id="networkName"
                                type="text"
                                value={networkName}
                                onChange={(e) =>
                                    setNetworkName(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter network name"
                                className={styles.input}
                            />

                        </div>

                    </div>
                )}

                {/* Username */}
                <div className={styles.formGroup}>

                    <label
                        htmlFor="username"
                        className={styles.label}
                    >
                        Username
                        <span className={styles.required}>
                            *
                        </span>
                    </label>

                    <div className={styles.inputWrapper}>

                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(
                                    e.target.value
                                )
                            }
                            placeholder="Enter username"
                            className={styles.input}
                        />

                    </div>

                </div>

                {/* Password */}
                <div className={styles.formGroup}>

                    <label
                        htmlFor="password"
                        className={styles.label}
                    >
                        Password
                        <span className={styles.required}>
                            *
                        </span>
                    </label>

                    <div className={styles.inputWrapper}>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            placeholder="Enter password"
                            className={styles.input}
                        />

                    </div>

                </div>

                {/* Buttons */}
                <div className={styles.btnRow}>

                    <button
                        type="button"
                        onClick={handleCancel}
                        className={`${styles.btn} ${styles.btnSecondary}`}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`${styles.btn} ${styles.btnPrimary}`}
                    >
                        {loading
                            ? "Signing In..."
                            : "Submit"}
                    </button>

                </div>

            </form>

        </div>
    );
}

export default Login;
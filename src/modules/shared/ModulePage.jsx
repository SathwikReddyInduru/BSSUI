import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MODULE_REGISTRY } from "../../components/common/ModuleSidebar";
import styles from "./ModulePage.module.css";

function ModulePage({ moduleKey }) {
    const navigate = useNavigate();

    const user = useSelector((state) => state.auth.user);
    const privileges = user?.privileges || [];
    const grantedIds = new Set(privileges.map((p) => p.moduleId));

    const moduleMeta = MODULE_REGISTRY[moduleKey];
    if (!moduleMeta) return <div className={styles.error}>Module not found.</div>;

    const visibleSubModules = Object.entries(moduleMeta.subModules).filter(
        ([id]) => grantedIds.has(id)
    );

    return (
        <div className={styles.root}>
            <div className={styles.breadcrumb}>
                <span className={styles.bcLink} onClick={() => navigate("/home")}>
                    Home
                </span>
                <span className={styles.bcSep}>›</span>
                <span className={styles.bcCurrent}>{moduleMeta.label}</span>
            </div>

            <h1 className={styles.title}>{moduleMeta.label}</h1>
            <p className={styles.subtitle}>
                Select a section to get started —{" "}
                {visibleSubModules.length} section{visibleSubModules.length !== 1 ? "s" : ""} available
            </p>

            <div className={styles.grid}>
                {visibleSubModules.map(([id, sub], idx) => (
                    <div
                        key={id}
                        className={styles.card}
                        style={{
                            animationDelay: `${idx * 70}ms`,
                            "--card-color": moduleMeta.color,
                        }}
                        onClick={() => navigate(sub.route)}
                    >
                        <div className={styles.cardId}>{id}</div>

                        <div className={styles.cardBody}>
                            <h2 className={styles.cardTitle}>{sub.label}</h2>
                            <p className={styles.cardDesc}>{sub.desc}</p>
                        </div>

                        <div className={styles.cardFooter}>
                            <button
                                className={styles.openLink}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(sub.route);
                                }}
                            >
                                Open
                                <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                                    <path
                                        d="M3 8h10M9 4l4 4-4 4"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ModulePage;
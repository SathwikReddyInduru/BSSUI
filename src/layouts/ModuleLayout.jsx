import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import ModuleSidebar from "../components/common/ModuleSidebar";
import { MODULE_REGISTRY, PLMN_TABS } from "../components/common/ModuleSidebar";
import styles from "../styles/Layout.module.css";
import { HomeIcon, MoveLeft } from "lucide-react";

function ModuleLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const user = useSelector((state) => state.auth.user);
    const privileges = user?.privileges || [];

    const currentModuleKey = Object.keys(MODULE_REGISTRY).find((key) =>
        location.pathname.startsWith(`/${key}`)
    );
    const moduleMeta = currentModuleKey ? MODULE_REGISTRY[currentModuleKey] : null;

    // Breadcrumb sub-section label
    let subLabel = null;
    if (moduleMeta) {
        if (moduleMeta.hasTabs) {
            const activeTab = PLMN_TABS.find((t) => location.pathname.startsWith(t.route));
            if (activeTab) subLabel = activeTab.label;
        } else {
            const subEntry = Object.values(moduleMeta.subModules || {}).find((s) =>
                location.pathname.startsWith(s.route)
            );
            if (subEntry) subLabel = subEntry.label;
        }
    }

    return (
        <div className={styles.layout}>
            <Header />

            <div className={styles.appLayout}>
                <ModuleSidebar />

                <div className={styles.moduleContainer}>
                    {moduleMeta && (
                        <div className={styles.breadcrumbBar}>
                            <div className={styles.breadcrumbLeft}>
                                <span className={styles.bcHome} onClick={() => navigate("/home")}>
                                    <HomeIcon size={22} />
                                </span>
                                <span className={styles.bcSep}>›</span>
                                <span className={styles.bcLink} onClick={() => navigate(`/${currentModuleKey}`)}>
                                    {moduleMeta.label}
                                </span>
                                {subLabel && (
                                    <>
                                        <span className={styles.bcSep}>›</span>
                                        <span className={styles.bcCurrent}>{subLabel}</span>
                                    </>
                                )}
                            </div>
                            <button className={styles.backBtn} onClick={() => navigate("/home")}>
                                <MoveLeft size={16} />
                                Back to modules
                            </button>
                        </div>
                    )}
                    <main className={styles.moduleContent}>
                        <Outlet />
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default ModuleLayout;
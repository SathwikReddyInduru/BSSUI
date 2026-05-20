import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import ManageIntegrators from './ManageIntegrators';
import styles from '../styles/IntegratorLayout.module.css';

// ─── Stub screens for future tabs ─────────────────────────────────────────────
const StubScreen = ({ title }) => (
    <div className={styles.stubBody}>
        <div className={styles.stubCard}>{title} — coming soon.</div>
    </div>
);

// ─── Tab definitions ──────────────────────────────────────────────────────────
const NAV_TABS = [
    {
        label: 'Manage Integrators',
        path: '/plmn/clc/integrator-management',
    },
    {
        label: 'Assign SIM/Vouchers',
        path: '/plmn/clc/integrator-management/assign-sim-vouchers',
    },
    {
        label: 'Manage Tariff Packs',
        path: '/plmn/clc/integrator-management/manage-tariff-packs',
    },
];

// ─── IntegratorLayout ─────────────────────────────────────────────────────────
const IntegratorLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // "Manage Integrators" is the index — treat exact match AND no sub-path as active
    const isTabActive = (tab) => {
        if (tab.path === '/plmn/clc/integrator-management') {
            return (
                location.pathname === '/plmn/clc/integrator-management' ||
                location.pathname === '/plmn/clc/integrator-management/'
            );
        }
        return location.pathname.startsWith(tab.path);
    };

    return (
        <div className={styles.wrapper}>
            <nav className={styles.topNav}>
                <div className={styles.navLinks}>
                    {NAV_TABS.map((tab) => (
                        <button
                            key={tab.label}
                            className={isTabActive(tab) ? styles.navLinkActive : styles.navLink}
                            onClick={() => navigate(tab.path)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </nav>

            <Routes>
                <Route index element={<ManageIntegrators />} />
                <Route
                    path="assign-sim-vouchers"
                    element={<StubScreen title="Assign SIM/Vouchers" />}
                />
                <Route
                    path="manage-tariff-packs"
                    element={<StubScreen title="Manage Tariff Packs" />}
                />
                <Route
                    path="*"
                    element={<Navigate to="/plmn/clc/integrator-management" replace />}
                />
            </Routes>
        </div>
    );
};

export default IntegratorLayout;
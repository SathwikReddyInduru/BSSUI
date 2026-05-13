import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from '../styles/Home.module.css';

// ─── Privilege ID → Top-level Module mapping ───────────────────────────────
const PRIVILEGE_MODULE_MAP = {
    PLMN: {
        triggerIds: ['CLC', 'CMS', 'TSG'],
        label: 'PLMN Services',
        desc: 'Network configuration, subscriber and traffic management',
        icon: '🌐',
        color: styles.modBlue,
        num: '01',
        route: '/plmn',
    },
    BILLING: {
        triggerIds: ['RAT'],
        label: 'Billing Management',
        desc: 'Invoicing, rate plans, payment gateway and revenue',
        icon: '💳',
        color: styles.modTeal,
        num: '02',
        route: '/billing',
    },
    UMS: {
        triggerIds: ['UMS'],
        label: 'User Management System',
        desc: 'Accounts, roles, permissions and access control',
        icon: '👤',
        color: styles.modAmber,
        num: '03',
        route: '/ums',
    },
    ICB: {
        triggerIds: ['ICB'],
        label: 'InterConnect Billing',
        desc: 'Carrier relations, settlement and traffic exchange',
        icon: '🔁',
        color: styles.modPurple,
        num: '04',
        route: '/icb',
    },
    TMS: {
        triggerIds: ['TMS'],
        label: 'Trouble Ticket Management',
        desc: 'Open issues, escalations, knowledge base and reports',
        icon: '🎫',
        color: styles.modCoral,
        num: '05',
        route: '/tms',
    },
    RMS: {
        triggerIds: ['RMS'],
        label: 'Roaming Management Server',
        desc: 'Partners, CAMEL services, TAP files and coverage maps',
        icon: '🌍',
        color: styles.modGreen,
        num: '06',
        route: '/rms',
    },
};

const Home = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [view, setView] = useState('grid');

    const user = useSelector((state) => state.auth.user);
    const userName = user?.userName || 'User';
    const networkName = user?.networkName || 'Network';

    const privilegeModuleIds = useMemo(() => {
        const privileges = user?.privileges || [];
        return new Set(privileges.map((p) => p.moduleId));
    }, [user]);

    const visibleModules = useMemo(() => {
        return Object.entries(PRIVILEGE_MODULE_MAP).filter(([, meta]) =>
            meta.triggerIds.some((id) => privilegeModuleIds.has(id))
        );
    }, [privilegeModuleIds]);

    const getGrantedSubModules = (triggerIds) =>
        triggerIds.filter((id) => privilegeModuleIds.has(id));

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return visibleModules;
        return visibleModules.filter(([, meta]) =>
            meta.label.toLowerCase().includes(q) ||
            meta.desc.toLowerCase().includes(q)
        );
    }, [visibleModules, search]);

    return (
        <div className={styles.homeRoot}>
            <div className={styles.homeInner}>

                <div className={styles.homeHeaderRow}>
                    <div>
                        <h1 className={styles.homeTitle}>
                            Select a <span className={styles.homeTitleAccent}>module</span>
                        </h1>
                        <p className={styles.homeSubtitle}>
                            Welcome back, <strong>{userName}</strong> — {visibleModules.length} modules available on <strong>{networkName}</strong>
                        </p>
                    </div>

                    <div className={styles.homeControls}>
                        <div className={styles.searchBox}>
                            <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="none">
                                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <input
                                className={styles.searchInput}
                                type="text"
                                placeholder="Search modules..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className={styles.viewToggle}>
                            <button
                                className={`${styles.viewBtn} ${view === 'grid' ? styles.viewBtnActive : ''}`}
                                onClick={() => setView('grid')}
                                title="Grid view"
                            >
                                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                                    <rect x="2" y="2" width="7" height="7" rx="1" />
                                    <rect x="11" y="2" width="7" height="7" rx="1" />
                                    <rect x="2" y="11" width="7" height="7" rx="1" />
                                    <rect x="11" y="11" width="7" height="7" rx="1" />
                                </svg>
                            </button>
                            <button
                                className={`${styles.viewBtn} ${view === 'list' ? styles.viewBtnActive : ''}`}
                                onClick={() => setView('list')}
                                title="List view"
                            >
                                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                                    <rect x="2" y="3" width="16" height="3" rx="1" />
                                    <rect x="2" y="9" width="16" height="3" rx="1" />
                                    <rect x="2" y="15" width="16" height="3" rx="1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className={styles.homeEmpty}>
                        <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
                            <circle cx="22" cy="22" r="14" stroke="currentColor" strokeWidth="2" />
                            <path d="M32 32L42 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <p>
                            {search
                                ? <>No modules match "<strong>{search}</strong>"</>
                                : 'No modules assigned to your account.'}
                        </p>
                    </div>
                ) : (
                    <div className={view === 'list' ? styles.modulesList : styles.modulesGrid}>
                        {filtered.map(([key, meta], idx) => {
                            const granted = getGrantedSubModules(meta.triggerIds);
                            return (
                                <div
                                    key={key}
                                    className={`${styles.moduleCard} ${meta.color}`}
                                    style={{ animationDelay: `${idx * 60}ms` }}
                                    onClick={() => navigate(meta.route, { state: { grantedSubModules: granted } })}
                                >
                                    <div className={styles.cardNum}>{meta.num}</div>
                                    <div className={styles.cardIconWrap}>
                                        <span>{meta.icon}</span>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <h2 className={styles.cardTitle}>{meta.label}</h2>
                                        <p className={styles.cardDesc}>{meta.desc}</p>
                                        <div className={styles.cardTags}>
                                            {granted.map((id) => (
                                                <span key={id} className={styles.cardTag}>{id}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={styles.cardFooter}>
                                        <button
                                            className={styles.openLink}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(meta.route, { state: { grantedSubModules: granted } });
                                            }}
                                        >
                                            Open module
                                            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                                                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
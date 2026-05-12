import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const MODULE_META = {
    BSSUI: {
        label: 'BSS Platform',
        desc: 'Billing, subscriber management, service plans and revenue operations',
        icon: '⚙️',
        route: '/bss',
        color: 'mod-blue',
        num: '01',
    },
    MSGUI: {
        label: 'Messaging Gateway',
        desc: 'SMS, USSD, MO/MT routing and messaging service configuration',
        icon: '💬',
        route: '/msg',
        color: 'mod-teal',
        num: '02',
    },
    HLRUI: {
        label: 'HLR Management',
        desc: 'Home location register, subscriber profiles and authentication',
        icon: '📡',
        route: '/hlr',
        color: 'mod-amber',
        num: '03',
    },
    HSSUI: {
        label: 'HSS Management',
        desc: 'Home subscriber server, IMS profiles and LTE authentication',
        icon: '🔐',
        route: '/hss',
        color: 'mod-purple',
        num: '04',
    },
    PCRFUI: {
        label: 'PCRF & Policy',
        desc: 'Policy control, QoS rules, data quotas and charging rules',
        icon: '📊',
        route: '/pcrf',
        color: 'mod-coral',
        num: '05',
    },
};

const Home = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [view, setView] = useState('grid');

    // Read login data stored after successful login
    const loginData = useMemo(() => {
        try { return JSON.parse(sessionStorage.getItem('loginData') || '{}'); }
        catch { return {}; }
    }, []);

    const availableModules = loginData.modules || Object.keys(MODULE_META);
    const networkName = loginData.networkName || 'Network';
    const userName = loginData.userName || 'User';

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return availableModules.filter((key) => {
            const meta = MODULE_META[key];
            if (!meta) return false;
            return !q || meta.label.toLowerCase().includes(q) || meta.desc.toLowerCase().includes(q) || key.toLowerCase().includes(q);
        });
    }, [availableModules, search]);

    return (
        <div className="home-root">
            <div className="home-inner">

                <div className="home-header-row">
                    <div>
                        <h1 className="home-title">
                            Select a <span className="home-title-accent">module</span>
                        </h1>
                        <p className="home-subtitle">
                            Welcome back, <strong>{userName}</strong> — {availableModules.length} modules available on <strong>{networkName}</strong>
                        </p>
                    </div>

                    <div className="home-controls">
                        <div className="search-box">
                            <svg className="search-icon" viewBox="0 0 20 20" fill="none">
                                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <input
                                className="search-input"
                                type="text"
                                placeholder="Search modules..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="view-toggle">
                            <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')} title="Grid view">
                                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                                    <rect x="2" y="2" width="7" height="7" rx="1" /><rect x="11" y="2" width="7" height="7" rx="1" />
                                    <rect x="2" y="11" width="7" height="7" rx="1" /><rect x="11" y="11" width="7" height="7" rx="1" />
                                </svg>
                            </button>
                            <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')} title="List view">
                                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                                    <rect x="2" y="3" width="16" height="3" rx="1" /><rect x="2" y="9" width="16" height="3" rx="1" />
                                    <rect x="2" y="15" width="16" height="3" rx="1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="home-empty">
                        <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
                            <circle cx="22" cy="22" r="14" stroke="currentColor" strokeWidth="2" />
                            <path d="M32 32L42 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <p>No modules match "<strong>{search}</strong>"</p>
                    </div>
                ) : (
                    <div className={`modules-container ${view === 'list' ? 'modules-list' : 'modules-grid'}`}>
                        {filtered.map((key, idx) => {
                            const meta = MODULE_META[key] || {
                                label: key, desc: `${key} module`, icon: '⬡',
                                route: `/${key.toLowerCase()}`, color: 'mod-blue',
                                num: String(idx + 1).padStart(2, '0'),
                            };
                            return (
                                <div
                                    key={key}
                                    className={`module-card ${meta.color}`}
                                    style={{ animationDelay: `${idx * 60}ms` }}
                                    onClick={() => navigate(meta.route)}
                                >
                                    <div className="card-num">{meta.num}</div>
                                    <div className="card-icon-wrap">
                                        <span className="card-icon">{meta.icon}</span>
                                    </div>
                                    <div className="card-body">
                                        <h2 className="card-title">{meta.label}</h2>
                                        <p className="card-desc">{meta.desc}</p>
                                    </div>
                                    <div className="card-footer">
                                        <button
                                            className="open-link"
                                            onClick={(e) => { e.stopPropagation(); navigate(meta.route); }}
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
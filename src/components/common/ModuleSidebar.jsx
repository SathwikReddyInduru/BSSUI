import { useState } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import styles from "../../styles/ModuleSidebar.module.css";

// ─── MODULE REGISTRY ─────────────────────────────────────────────────────────
export const MODULE_REGISTRY = {
    plmn: {
        label: "PLMN Services",
        color: "#2563eb",
        hasTabs: true,
        triggerIds: ["CLC", "CMS", "TSG"],
        subModules: {
            CLC: { label: "Card Life Cycle Management", desc: "SIM/Voucher/Magnetic card production", route: "/plmn/clc" },
            CMS: { label: "Customer Management", desc: "Subscriber management system", route: "/plmn/cms" },
            TSG: { label: "Telecom & Service Gateway", desc: "Telecommunication services gateway", route: "/plmn/tsg" },
        },
    },
    billing: {
        label: "Billing Management",
        icon: "💳",
        color: "#10b981",
        triggerIds: ["RAT", "SET", "CFG"],
        subModules: {
            RAT: { label: "Rating & Billing", desc: "Rating and billing management", route: "/billing/rat" },
            SET: { label: "Settlements", desc: "Report generation", route: "/billing/set" },
            CFG: { label: "Configuration", desc: "Configuration management", route: "/billing/cfg" },
        },
    },
    ums: {
        label: "User Management",
        icon: "👤",
        color: "#f59e0b",
        triggerIds: ["UMS"],
        subModules: {
            UMS: { label: "User Management System", desc: "Workbench for user administration", route: "/ums/main" },
        },
    },
    icb: {
        label: "InterConnect Billing",
        icon: "🔁",
        color: "#8b5cf6",
        triggerIds: ["ICB"],
        subModules: {
            ICB: { label: "InterConnect Billing", desc: "Inter connect billing system", route: "/icb/main" },
        },
    },
    tms: {
        label: "Trouble Tickets",
        icon: "🎫",
        color: "#ef4444",
        triggerIds: ["TMS"],
        subModules: {
            TMS: { label: "Trouble Ticket Management", desc: "Trouble ticket system", route: "/tms/main" },
        },
    },
    rms: {
        label: "Roaming Management",
        icon: "🌍",
        color: "#16a34a",
        triggerIds: ["RMS", "MNP", "WNF"],
        subModules: {
            RMS: { label: "Roaming Management Server", desc: "Roaming management server", route: "/rms/main" },
            MNP: { label: "Mobile Number Portability", desc: "Mobile number portability", route: "/rms/mnp" },
            WNF: { label: "Welcome Notification", desc: "Welcome notification for roamers", route: "/rms/wnf" },
        },
    },
};

// ─── PLMN TAB DATA (corrected per screenshots) ───────────────────────────────
export const PLMN_TABS = [
    {
        id: "CLC",
        label: "Card Life Cycle Management",
        route: "/plmn/clc",
        sidebarItems: [
            { label: "Card Voucher Profile Categories", route: "/plmn/clc/card-voucher-profile-categories" },
            {
                label: "Card Profile",
                route: "/plmn/clc/card-profile",
                icon: "card",
                children: [
                    { label: "View Card Profiles", route: "/plmn/clc/card-profile/view" },
                    { label: "Create Card Profile", route: "/plmn/clc/card-profile/create" },
                ],
            },
            {
                label: "Vouchers",
                route: "/plmn/clc/vouchers",
                icon: "tag",
                children: [
                    { label: "View Vouchers", route: "/plmn/clc/vouchers/view" },
                    { label: "Create Voucher", route: "/plmn/clc/vouchers/create" },
                ],
            },
        ],
    },
    {
        id: "CMS",
        label: "Customer Management",
        route: "/plmn/cms",
        sidebarItems: [
            {
                label: "SIM & Voucher Management",
                isGroup: true,
                children: [
                    { label: "Card Voucher Profile Categories", route: "/plmn/cms/card-voucher-profile-categories" },
                    {
                        label: "Card Profile",
                        route: "/plmn/cms/card-profile",
                        icon: "card",
                        children: [
                            { label: "View Card Profiles", route: "/plmn/cms/card-profile/view" },
                            { label: "Create Card Profile", route: "/plmn/cms/card-profile/create" },
                        ],
                    },
                    {
                        label: "Vouchers",
                        route: "/plmn/cms/vouchers",
                        icon: "tag",
                        children: [
                            { label: "View Vouchers", route: "/plmn/cms/vouchers/view" },
                            { label: "Create Voucher", route: "/plmn/cms/vouchers/create" },
                        ],
                    },
                ],
            },
            {
                label: "Vendor Management",
                isGroup: true,
                children: [
                    { label: "Goods Receipts", route: "/plmn/cms/goods-receipts" },
                    {
                        label: "Vendor Details",
                        route: "/plmn/cms/vendor-details",
                        icon: "card",
                        children: [
                            { label: "View Vendors", route: "/plmn/cms/vendor-details/view" },
                            { label: "Add Vendor", route: "/plmn/cms/vendor-details/add" },
                        ],
                    },
                ],
            },
            {
                label: "Inventory Management",
                isGroup: true,
                children: [
                    { label: "Upload MSISDN", route: "/plmn/cms/upload-msisdn" },
                    { label: "Manage Inventory Type", route: "/plmn/cms/manage-inventory-type" },
                    { label: "Inventory Upload", route: "/plmn/cms/inventory-upload" },
                    { label: "Upload PUK", route: "/plmn/cms/upload-puk" },
                    { label: "Inventory Approve", route: "/plmn/cms/inventory-approve" },
                    { label: "Inventory Status", route: "/plmn/cms/inventory-status" },
                    { label: "Extract SIM Details", route: "/plmn/cms/extract-sim-details" },
                    { label: "Triplet Association", route: "/plmn/cms/triplet-association" },
                    { label: "Triplet Association View", route: "/plmn/cms/triplet-association-view" },
                    { label: "Location Bulk Upload", route: "/plmn/cms/location-bulk-upload" },
                    { label: "Upload Fancy MSISDN", route: "/plmn/cms/upload-fancy-msisdn" },
                ],
            },
        ],
    },
    {
        id: "TSG",
        label: "Telecom & Service Gateway",
        route: "/plmn/tsg",
        sidebarItems: [
            { label: "Circle Operator Prefix", route: "/plmn/tsg/circle-operator-prefix" },
            { label: "Free Numbers", route: "/plmn/tsg/free-numbers" },
            { label: "Local Codes", route: "/plmn/tsg/local-codes" },
            { label: "Location Details", route: "/plmn/tsg/location-details" },
            { label: "Network Details", route: "/plmn/tsg/network-details" },
            { label: "Semi Local Codes", route: "/plmn/tsg/semi-local-codes" },
            { label: "Service Numbers", route: "/plmn/tsg/service-numbers" },
            { label: "Switch Details", route: "/plmn/tsg/switch-details" },
            { label: "Telecom Prefix Details", route: "/plmn/tsg/telecom-prefix-details" },
            { label: "Toll Free", route: "/plmn/tsg/toll-free" },
            { label: "Configure Thresholds", route: "/plmn/tsg/configure-thresholds" },
            { label: "Upload MSCIds", route: "/plmn/tsg/upload-mscids" },
            { label: "NDC MSISDN Mapping", route: "/plmn/tsg/ndc-msisdn-mapping" },
        ],
    },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconPerson() {
    return (
        <svg viewBox="0 0 20 20" fill="white" width="18" height="18">
            <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z" />
        </svg>
    );
}

function IconCard() {
    return (
        <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
            <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
            <path d="M2 9h16" stroke="currentColor" strokeWidth="1.4" />
            <rect x="5" y="12" width="4" height="1.5" rx="0.5" fill="currentColor" />
        </svg>
    );
}

function IconTag() {
    return (
        <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
            <path d="M3 3h6.5l7 7-6.5 6.5-7-7V3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <circle cx="7" cy="7" r="1.2" fill="currentColor" />
        </svg>
    );
}

function ChevronRight({ open }) {
    return (
        <svg
            viewBox="0 0 16 16" fill="none" width="13" height="13"
            style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.18s ease", flexShrink: 0 }}
        >
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ChevronDown({ open }) {
    return (
        <svg
            viewBox="0 0 16 16" fill="none" width="13" height="13"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.18s ease", flexShrink: 0 }}
        >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function getNavIcon(icon) {
    if (icon === "card") return <IconCard />;
    if (icon === "tag") return <IconTag />;
    return null;
}

// ─── Accordion item (leaf with expandable children) ──────────────────────────
function AccordionItem({ item, color, depth = 0 }) {
    const location = useLocation();
    const navigate = useNavigate();
    const isChildActive = item.children?.some((c) => location.pathname.startsWith(c.route));
    const [open, setOpen] = useState(isChildActive);

    const isDeep = depth > 0;

    return (
        <li>
            <button
                className={`${styles.navRow} ${isDeep ? styles.navRowDeep : ""} ${isChildActive ? styles.navRowActive : ""}`}
                style={isChildActive ? { color } : {}}
                onClick={() => { setOpen((o) => !o); navigate(item.route); }}
            >
                {item.icon ? (
                    <span className={styles.navIcon}>{getNavIcon(item.icon)}</span>
                ) : (
                    <span className={styles.navDot} style={isChildActive ? { background: color } : {}} />
                )}
                <span className={styles.navLabel}>{item.label}</span>
                <ChevronRight open={open} />
            </button>
            {open && (
                <ul className={styles.subList}>
                    {item.children.map((child) => (
                        <li key={child.route}>
                            <NavLink
                                to={child.route}
                                className={({ isActive }) =>
                                    `${styles.navRow} ${styles.navRowSub} ${isActive ? styles.navRowSubActive : ""}`
                                }
                                style={({ isActive }) => isActive ? { color } : {}}
                            >
                                <span className={styles.subLine} style={{ borderColor: color + "44" }} />
                                <span className={styles.navLabel}>{child.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
}

// ─── Plain leaf item ──────────────────────────────────────────────────────────
function LeafItem({ item, color, depth = 0 }) {
    return (
        <li>
            <NavLink
                to={item.route}
                className={({ isActive }) =>
                    `${styles.navRow} ${depth > 0 ? styles.navRowDeep : ""} ${isActive ? styles.navRowActive : ""}`
                }
                style={({ isActive }) => isActive ? { color } : {}}
            >
                <span className={styles.navDot} />
                <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
        </li>
    );
}

// ─── Render sidebar item list ─────────────────────────────────────────────────
function SidebarItemList({ items, color }) {
    return (
        <ul className={styles.navList}>
            {items.map((item) => {
                if (item.isGroup) {
                    return (
                        <li key={item.label} className={styles.groupBlock}>
                            <div className={styles.groupLabel}>{item.label}</div>
                            <ul className={styles.navList}>
                                {item.children.map((child) =>
                                    child.children
                                        ? <AccordionItem key={child.route} item={child} color={color} depth={1} />
                                        : <LeafItem key={child.route} item={child} color={color} depth={1} />
                                )}
                            </ul>
                        </li>
                    );
                }
                if (item.children) {
                    return <AccordionItem key={item.route} item={item} color={color} />;
                }
                return <LeafItem key={item.route} item={item} color={color} />;
            })}
        </ul>
    );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
function ModuleSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const user = useSelector((state) => state.auth.user);
    const privileges = user?.privileges || [];
    const grantedIds = new Set(privileges.map((p) => p.moduleId));

    const currentModuleKey = Object.keys(MODULE_REGISTRY).find((key) =>
        location.pathname.startsWith(`/${key}`)
    );
    const moduleMeta = currentModuleKey ? MODULE_REGISTRY[currentModuleKey] : null;
    if (!moduleMeta) return null;

    // ── PLMN ─────────────────────────────────────────────────────────────────
    if (moduleMeta.hasTabs) {
        const grantedTabs = PLMN_TABS.filter((t) => grantedIds.has(t.id));
        const activeTab =
            grantedTabs.find((t) => location.pathname.startsWith(t.route)) ||
            grantedTabs[0];
        if (!activeTab) return null;

        return (
            <aside className={styles.sidebar}>
                {/* ── Module header ── */}
                <div className={styles.moduleHeader}>
                    <div className={styles.moduleIconBox} style={{ background: moduleMeta.color }}>
                        <IconPerson />
                    </div>
                    <span className={styles.moduleTitle}>{moduleMeta.label}</span>
                    <button className={styles.collapseBtn} onClick={() => setCollapsed((c) => !c)}>
                        <ChevronDown open={!collapsed} />
                    </button>
                </div>

                {!collapsed && (
                    <>
                        {/* ── Sub-module tabs (CLC / CMS / TSG as nav items) ── */}
                        <nav className={styles.tabNav}>
                            {grantedTabs.map((tab) => {
                                const isActive = location.pathname.startsWith(tab.route);
                                return (
                                    <button
                                        key={tab.id}
                                        className={`${styles.tabRow} ${isActive ? styles.tabRowActive : ""}`}
                                        style={isActive ? { color: moduleMeta.color, background: moduleMeta.color + "12" } : {}}
                                        onClick={() => navigate(tab.route)}
                                    >
                                        <span
                                            className={styles.tabBullet}
                                            style={{ background: isActive ? moduleMeta.color : "#d1d5db" }}
                                        />
                                        <span className={styles.tabLabel}>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        {/* ── Divider ── */}
                        <div className={styles.divider} />

                        {/* ── Sub-items for active tab ── */}
                        <nav className={styles.itemNav}>
                            <SidebarItemList items={activeTab.sidebarItems} color={moduleMeta.color} />
                        </nav>
                    </>
                )}
            </aside>
        );
    }

    // ── Other modules ─────────────────────────────────────────────────────────
    const visibleSubModules = Object.entries(moduleMeta.subModules).filter(
        ([id]) => grantedIds.has(id)
    );

    return (
        <aside className={styles.sidebar}>
            <div className={styles.moduleHeader}>
                <div className={styles.moduleIconBox} style={{ background: moduleMeta.color }}>
                    <span style={{ fontSize: 16, lineHeight: 1 }}>{moduleMeta.icon}</span>
                </div>
                <span className={styles.moduleTitle}>{moduleMeta.label}</span>
                <button className={styles.collapseBtn} onClick={() => setCollapsed((c) => !c)}>
                    <ChevronDown open={!collapsed} />
                </button>
            </div>

            {!collapsed && (
                <>
                    <div className={styles.divider} />
                    <nav className={styles.itemNav}>
                        <ul className={styles.navList}>
                            {visibleSubModules.map(([id, sub]) => (
                                <li key={id}>
                                    <NavLink
                                        to={sub.route}
                                        className={({ isActive }) =>
                                            `${styles.navRow} ${isActive ? styles.navRowActive : ""}`
                                        }
                                        style={({ isActive }) => isActive ? { color: moduleMeta.color } : {}}
                                    >
                                        <span className={styles.navDot} />
                                        <span className={styles.navLabel}>{sub.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </>
            )}
        </aside>
    );
}

export default ModuleSidebar;
import  { useState } from "react";
import { ArrowLeft } from "lucide-react";

import styles from "../styles/CardProfileLayout.module.css";

import CardProfiles from "./CardProfiles";
import MapAccountProfile from "./MapAccountProfile";
import PromoMapCardProfileCells from "./PromoMapCardProfileCells";

const NAV_TABS = [
    "Card Profiles",
    "Map Account Profile",
    "PromoMap Card Profile Cells",
];

function CardProfileLayout({ onBack }) {
    const [activeTab, setActiveTab] = useState("Card Profiles");

    return (
        <div className={styles.wrapper}>

            {/* TOP NAVIGATION */}
            <div className={styles.topNav}>

                {onBack && (
                    <button className={styles.backBtn} onClick={onBack} title="Go back">
                        <ArrowLeft size={16} />
                    </button>
                )}

                <div className={styles.navLinks}>
                    {NAV_TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={
                                activeTab === tab
                                    ? styles.navLinkActive
                                    : styles.navLink
                            }
                        >
                            {tab}
                        </button>
                    ))}
                </div>

            </div>

            {/* BODY */}
            <div className={styles.body}>
                {activeTab === "Card Profiles" && <CardProfiles />}
                {activeTab === "Map Account Profile" && <MapAccountProfile />}
                {activeTab === "PromoMap Card Profile Cells" && <PromoMapCardProfileCells />}
            </div>

        </div>
    );
}

export default CardProfileLayout;
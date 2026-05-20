
import  { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showSuccess, showError } from "@/utils/toast";
import { PRIVILEGES, hasPrivilege } from "@/ConstantFiles/privileges";

import {
  searchVoucher,
  fetchExpiredProfiles,
  generateExpiredVoucherFile,
  clearVoucher,
} from "@/store/slices/plmnSlices/VoucherSearchSlice";

import styles from "../styles/VoucherSearch.module.css";

const RECENT_KEY = "voucher_recent_searches";


const TAB = {
  SEARCH: "search",
  EXPIRED: "expired",
};

const getRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveRecent = (entry) => {
  const prev = getRecent().filter((r) => r.no !== entry.no);
  const next = [entry, ...prev].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
};

const getValue = (row, ...keys) => {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null) return row[key];
  }
  return "";
};

const STATUS_META = {
  A: { label: "Active", cls: "statusActive" },
  E: { label: "Expired", cls: "statusExpired" },
  P: { label: "Pending", cls: "statusPending" },
  G: { label: "Generated", cls: "statusGenerated" },
  C: { label: "Cancel", cls: "statusCancel" },
};

function StatusBadge({ code }) {
  const raw = String(code || "").toUpperCase().trim();

  const meta = STATUS_META[raw[0]] || {
    label: raw || "—",
    cls: "statusUnknown",
  };

  return (
    <span className={`${styles.badge} ${styles[meta.cls]}`}>
      {meta.label}
    </span>
  );
}

export default function VoucherSearchScreen() {
  const dispatch = useDispatch();

  const privileges = useSelector(
  (state) => state.auth.privileges
);

  const {
    voucher,
    expiredProfiles = [],
    loading,
    expiredLoading,
    generating,
  } = useSelector((s) => s.voucherSearch);

  const [tab, setTab] = useState(TAB.SEARCH);
  const [voucherNo, setVoucherNo] = useState("");
  const [preview, setPreview] = useState("");
  const [recentSearches, setRecentSearches] = useState(getRecent);
  const [inputMethod, setInputMethod] = useState("single"); // "single" | "range"
const [fromSerial,  setFromSerial]  = useState("");
const [toSerial,    setToSerial]    = useState("");

  useEffect(() => {
    if (tab === TAB.EXPIRED) {
      dispatch(fetchExpiredProfiles());
    }
  }, [tab, dispatch]);

  const handleTabChange = (selectedTab) => {
    setTab(selectedTab);
    setPreview("");

    if (selectedTab === TAB.SEARCH) {
      dispatch(clearVoucher());
    }
  };

//   const handleSearch = async () => {
//   if (!voucherNo.trim()) {
//     showError("Please enter a voucher serial number");
//     return;
//   }

//   try {
//     await dispatch(searchVoucher({ voucherNo: voucherNo.trim() })).unwrap();

//     saveRecent({ no: voucherNo.trim(), status: "" });
//     setRecentSearches(getRecent());

//     showSuccess("Voucher details fetched successfully");
//   } catch (err) {
//     showError(err || "Voucher not found");
//   }
// };
const handleSearch = async () => {
  if (!voucherNo.trim()) {
    showError("Please enter a voucher serial number");
    return;
  }

  try {
    const response = await dispatch(
      searchVoucher({ voucherNo: voucherNo.trim() })
    ).unwrap();

    if (!response || Object.keys(response).length === 0) {
      showError("Voucher details not found");
      return;
    }

    saveRecent({ no: voucherNo.trim(), status: "" });
    setRecentSearches(getRecent());

    showSuccess("Voucher details fetched successfully");
  } catch (err) {
    showError("Voucher details not found");
  }
};

const handleQuickSearch = async (no) => {
  setVoucherNo(no);

  try {
    const response = await dispatch(
      searchVoucher({ voucherNo: no })
    ).unwrap();

    if (!response || Object.keys(response).length === 0) {
      showError("Voucher details not found");
      return;
    }

    const next = getRecent().filter((r) => r.no !== no);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    setRecentSearches(next);

    showSuccess("Voucher details fetched successfully");
  } catch (err) {
    showError("Voucher details not found");
  }
};

  const handleCancelSearch = () => {
    setVoucherNo("");
    dispatch(clearVoucher());
    localStorage.removeItem(RECENT_KEY);
    setRecentSearches([]);
  };

//  const handleQuickSearch = async (no) => {
//   setVoucherNo(no);

//   try {
//     await dispatch(searchVoucher({ voucherNo: no })).unwrap();

//     const next = getRecent().filter((r) => r.no !== no);
//     localStorage.setItem(RECENT_KEY, JSON.stringify(next));
//     setRecentSearches(next);

//     showSuccess("Voucher details fetched successfully");
//   } catch (err) {
//     showError(err || "Voucher not found");
//   }
// };

  const handleRemoveRecent = (e, no) => {
    e.stopPropagation();

    const next = getRecent().filter((r) => r.no !== no);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    setRecentSearches(next);
  };

  const handleGenerate = async (profileId) => {
    if (!profileId) {
      alert("Profile ID is missing");
      return;
    }

    try {
      const blob = await dispatch(
        generateExpiredVoucherFile({ profileId })
      ).unwrap();

      setPreview(await blob.text());
      showSuccess("Expired vouchers previewed successfully");
    } catch (err) {
      alert(err || "Generate failed");
    }
  };

  const previewRows = preview
    ? preview
        .trim()
        .split("\n")
        .filter((line, index) => index !== 0 && line.trim())
        .map((line) => {
          const parts = line.trim().split(/\s+/);

          return {
            serialNumber: parts[0],
            profileName: parts[1],
            status: parts[2],
            statusDate: parts[3],
            poNumber: parts[4],
          };
        })
    : [];

  const getFormattedPreview = () => {
    return previewRows
      .map((row, index) => {
        if (index === 0) {
          return (
            "Serial Number".padEnd(20) +
            "Profile Name".padEnd(18) +
            "Status".padEnd(10) +
            "Status Date".padEnd(18) +
            "PO Number\n" +
            "-".repeat(78) +
            "\n" +
            String(row.serialNumber).padEnd(20) +
            String(row.profileName).padEnd(18) +
            String(row.status).padEnd(10) +
            String(row.statusDate).padEnd(18) +
            String(row.poNumber)
          );
        }

        return (
          String(row.serialNumber).padEnd(20) +
          String(row.profileName).padEnd(18) +
          String(row.status).padEnd(10) +
          String(row.statusDate).padEnd(18) +
          String(row.poNumber)
        );
      })
      .join("\n");
  };

  const handleSave = () => {
    const formattedPreview = getFormattedPreview();

    const url = URL.createObjectURL(
      new Blob([formattedPreview], { type: "text/plain" })
    );

    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: "Expired_Vouchers.txt",
    });

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
    showSuccess("Expired vouchers downloaded successfully");
  };

  const handlePrint = () => {
    const formattedPreview = getFormattedPreview();

    const w = window.open("", "_blank");

    w.document.write(`
      <html>
        <head>
          <title>Expired Vouchers</title>
          <style>
            body {
              font-family: monospace;
              white-space: pre;
              padding: 20px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>${formattedPreview}</body>
      </html>
    `);

    w.document.close();
    w.focus();
    w.print();
    showSuccess("Expired vouchers downloaded successfully");
  };

  const voucherSerial = voucher
    ? getValue(
        voucher,
        "voucherSerialNo",
        "voucherserialno",
        "VOUCHER_SERIAL_NO",
        "VOUCHERSERIALNO"
      )
    : null;

return (
  <div className={styles["voucher-page"]}>

    <div className={styles["voucher-top-bar"]}>

      <div className={styles["titleAndTabs"]}>

        {/* LEFT SIDE */}
        <div>
          <h2 className={styles["voucher-heading"]}>
            Vouchers
          </h2>

          <p className={styles["voucher-subtitle"]}>
            Search voucher details
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className={styles["voucher-tabs"]}>
          {hasPrivilege(privileges, PRIVILEGES.VOUCHER_SEARCH) && (
          <button
            type="button"
            className={tab === TAB.SEARCH ? styles["active-tab"] : ""}
            onClick={() => handleTabChange(TAB.SEARCH)}
          >
            Voucher Search
          </button>)}

{hasPrivilege(privileges, PRIVILEGES.EXPIRED_VOUCHERS) && (
          <button
            type="button"
            className={tab === TAB.EXPIRED ? styles["active-tab"] : ""}
            onClick={() => handleTabChange(TAB.EXPIRED)}
          >
            Expired Vouchers
          </button>)}
        </div>

      </div>

    </div>

    <div className={styles.tabDivider} />

   

{tab === TAB.SEARCH && (
  <>
    {!voucher ? (
      <div className={styles["voucher-search-layout"]}>

        {/* LEFT — RECENT SEARCHES */}
        <div className={styles["recent-box"]}>
          <p className={styles["recent-title"]}>Recent Searches</p>

          {recentSearches.length === 0 ? (
            <p className={styles["empty-recent"]}>No recent searches yet</p>
          ) : (
            <div className={styles["recent-list"]}>
              {recentSearches.map((r) => (
                <button
                  type="button"
                  key={r.no}
                  className={styles["recent-item"]}
                  onClick={() => handleQuickSearch(r.no)}
                >
                  <span>{r.no}</span>
                  <span
                    className={styles["recent-remove"]}
                    onClick={(e) => handleRemoveRecent(e, r.no)}
                  >
                    ×
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DIVIDER */}
        <div className={styles["search-section-divider"]} />

        {/* RIGHT — SEARCH CARD */}
        <div className={styles["voucher-create-card"]}>
          <div className={styles["voucher-card-title"]}>
            🔍 Search Voucher
          </div>

          {/* ── INPUT METHOD TOGGLE (NEW) ── */}
        
<div className={styles["voucher-form-body"]}>
  <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>

    {/* VOUCHER SEARCH label + line */}
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
      <span style={{
        fontSize: 11,
        fontWeight: 800,
        color: "#2563eb",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        whiteSpace: "nowrap",
      }}>
        Voucher Search
      </span>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, #bfdbfe, transparent)"}} />
    </div>

    {/* INPUT BOX — full width */}
   <div style={{
  width: "100%",
  maxWidth: "980px",
  margin: "0 auto",
  background: "#f8fbff",
  border: "1px solid #dbeafe",
  borderRadius: 12,
  padding: "20px 24px",
}}>
      <div className={styles["voucher-field"]}>
        <label>
          Voucher Serial Number{" "}
          <span className={styles["mandatory"]}>*</span>
        </label>

        <input  style={{
      width: "100%"}}
          value={voucherNo}
          onChange={(e) => setVoucherNo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="e.g. 7300340001"
        />

        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#94a3b8",textAlign:"center" }}>
          Enter a valid voucher serial number to fetch voucher details.
        </p>
      </div>
    </div>

  </div>
</div>
          {/* BUTTONS — untouched */}
          <div className={styles["voucher-form-buttons"]}>
            <button
              type="button"
              className={styles["voucher-submit-btn"]}
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Searching..." : "Submit"}
            </button>
            <button
              type="button"
              className={styles["voucher-cancel-btn"]}
              onClick={handleCancelSearch}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

    ) : (
      /* ── RESULT VIEW — completely untouched ── */
      <div className={styles["voucher-details-page"]}>
        <button
          type="button"
          className={styles["back-btn"]}
          onClick={() => dispatch(clearVoucher())}
        >
          ← Back
        </button>

        <div className={styles["result-card"]}>
          <div className={styles["result-header"]}>
            <div>
              <p className={styles["result-serial"]}>{voucherSerial || "—"}</p>
              <p className={styles["result-sub"]}>Voucher Details</p>
            </div>
            <div className={styles["result-actions"]}>
              <StatusBadge
                code={getValue(voucher,"statusCode","statuscode","STATUS_CODE","STATUSCODE")}
              />
            </div>
          </div>

          <div className={styles["detail-grid"]}>
            {[
              { label: "Profile",     val: getValue(voucher,"profileName","profilename","PROFILE_NAME","PROFILENAME") },
              { label: "Status Code", val: getValue(voucher,"statusCode","statuscode","STATUS_CODE","STATUSCODE") },
              { label: "Date",        val: getValue(voucher,"statusDate","statusdate","STATUS_DATE","STATUSDATE") },
              { label: "Office",      val: getValue(voucher,"officeName","officename","OFFICE_NAME","OFFICENAME") },
            ].map(({ label, val }) => (
              <div key={label} className={styles["detail-cell"]}>
                <p className={styles["detail-label"]}>{label}</p>
                <p className={styles["detail-value"]}>{val || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </>
)}
      {tab === TAB.EXPIRED && !preview && (
        <div className={styles["voucher-table-card"]}>
          <table className={styles["voucher-table"]}>
            <thead>
              <tr>
                <th>Voucher Profile Name</th>
                <th>Record Count</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {expiredLoading ? (
                <tr>
                  <td colSpan="3" className={styles["voucher-empty"]}>
                    Loading expired vouchers...
                  </td>
                </tr>
              ) : expiredProfiles.length === 0 ? (
                <tr>
                  <td colSpan="3" className={styles["voucher-empty"]}>
                    No expired vouchers found.
                  </td>
                </tr>
              ) : (
                expiredProfiles.map((r, i) => {
                  const profileName = getValue(
                    r,
                    "profileName",
                    "profilename",
                    "PROFILE_NAME",
                    "PROFILENAME"
                  );

                  const recordCount = getValue(
                    r,
                    "recordCount",
                    "recordcount",
                    "RECORD_COUNT",
                    "RECORDCOUNT"
                  );

                  const profileId = getValue(
                    r,
                    "profileId",
                    "profileid",
                    "PROFILE_ID",
                    "PROFILEID"
                  );

                  return (
                    <tr key={`${profileId}-${i}`}>
                      <td>{profileName || "—"}</td>

                      <td>
                        <span className={styles["count-pill"]}>
                          {recordCount || "0"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={styles["generate-btn"]}
                          onClick={() => handleGenerate(profileId)}
                          disabled={generating}
                        >
                          {generating ? "Generating..." : "Generate"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === TAB.EXPIRED && preview && (
        <div className={styles["preview-card"]}>
          <div className={styles["preview-header"]}>
            <div>
              <h3>Generated Expired Vouchers</h3>
             
            </div>

            <div className={styles["preview-actions"]}>
              <button
                type="button"
                className={styles["save-btn"]}
                onClick={handleSave}
              >
                Save
              </button>

              <button
                type="button"
                className={styles["print-btn"]}
                onClick={handlePrint}
              >
                Print
              </button>

              <button
                type="button"
                className={styles["back-btn"]}
                onClick={() => setPreview("")}
              >
                ← Back
              </button>
            </div>
          </div>

          <div className={styles["preview-table-wrap"]}>
            <table className={styles["preview-table"]}>
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Profile Name</th>
                  <th>Status</th>
                  <th>Status Date</th>
                  <th>PO Number</th>
                </tr>
              </thead>

              <tbody>
                {previewRows.map((row, index) => (
                  <tr key={index}>
                    <td>{row.serialNumber}</td>
                    <td>{row.profileName}</td>
                    <td>{row.status}</td>
                    <td>{row.statusDate}</td>
                    <td>{row.poNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

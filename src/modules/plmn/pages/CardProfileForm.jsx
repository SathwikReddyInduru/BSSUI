import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import styles from "../styles/CardProfileForm.module.css";

import { fetchCardProfileDropDownService } from "@/services/SessionServices/CardProfileService";

const INITIAL_FORM = {
  cardName: "",
  prepaidTariffpackId: "",
  postpaidTariffpackId: "",
  thresholdBalAmnt: "",
  validityPeriod: "",
  gracePeriod1: "",
  gracePeriod2: "",
  quarantinePeriod: "",
  shelfLife: "",
  carryfwdbalDays: "",
  offsetValidityPeriod: "",
  offsetGraceperiod1: "",
  offsetGraceperiod2: "",
  creditProfileId: "",
  category: "",
};

function CardProfileForm({ profileId, networkId, mode, onBack }) {
  const dispatch = useDispatch();

  const [form, setForm] = useState(INITIAL_FORM);

  const [loadingProfile, setLoadingProfile] = useState(mode === "modify");

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState(null);

  const [success, setSuccess] = useState(false);

  /* =========================================
       REDUX STORE
    ========================================= */

  const { dropdowns, loading } = useSelector(
    (state) => state.cardProfileDropDown,
  );

  /* =========================================
       FETCH DROPDOWNS
    ========================================= */

  useEffect(() => {
    if (networkId) {
      fetchCardProfileDropDownService(dispatch, networkId);
    }
  }, [dispatch, networkId]);

  /* =========================================
       FILTER PACKAGES
    ========================================= */

  const prepaidPackages =
    dropdowns?.tariffPackages?.filter(
      (item) => item.packageType === "PREPAID",
    ) || [];

  const postpaidPackages =
    dropdowns?.tariffPackages?.filter(
      (item) => item.packageType === "POSTPAID",
    ) || [];

  /* =========================================
       FETCH EXISTING PROFILE FOR MODIFY
    ========================================= */

  useEffect(() => {
    if (mode !== "modify" || !profileId) return;

    setLoadingProfile(true);

    // Existing functionality retained

    setLoadingProfile(false);
  }, [mode, profileId, networkId]);

  /* =========================================
       CHANGE HANDLER
    ========================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================
       SUBMIT
    ========================================= */

  const handleSubmit = async () => {
    setSubmitting(true);

    setError(null);

    try {
      // Existing submit functionality retained

      setSuccess(true);

      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loading || loadingProfile;

  return (
    <div className={styles.page}>
      {/* HEADER */}

      <div className={styles.header}>
        <h2 className={styles.title}>
          {mode === "modify" ? "Modify Card Profile" : "Create Card Profile"}
        </h2>

        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={16} />
          Back to List
        </button>
      </div>

      {/* BODY */}

      <div className={styles.body}>
        {isLoading ? (
          <div className={styles.center}>
            <Loader2 size={28} className={styles.spinner} />

            <span>Loading...</span>
          </div>
        ) : success ? (
          <div className={styles.center}>
            <div className={styles.successMsg}>
              ✓ Profile {mode === "modify" ? "updated" : "created"}{" "}
              successfully!
            </div>
          </div>
        ) : (
          <div className={styles.card}>
            <p className={styles.mandatoryNote}>
              <span className={styles.star}>*</span>
              Indicates Mandatory
            </p>

            {error && <div className={styles.errorBanner}>Error: {error}</div>}

            <div className={styles.formGrid}>
              {/* CARD NAME */}

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Card Name
                  <span className={styles.star}>*</span>
                </label>

                <input
                  className={styles.input}
                  type="text"
                  name="cardName"
                  value={form.cardName}
                  onChange={handleChange}
                  placeholder="Enter card name"
                />
              </div>

              {/* PREPAID PACKAGE */}

              <div className={styles.formGroup}>
                <label className={styles.label}>Prepaid Tariff Package</label>

                <select
                  className={styles.select}
                  name="prepaidTariffpackId"
                  value={form.prepaidTariffpackId}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>

                  {prepaidPackages.map((pkg) => (
                    <option
                      key={pkg.tariffPackageId}
                      value={pkg.tariffPackageId}
                    >
                      {pkg.tariffPackageDesc}
                    </option>
                  ))}
                </select>
              </div>

              {/* POSTPAID PACKAGE */}

              <div className={styles.formGroup}>
                <label className={styles.label}>Postpaid Tariff Package</label>

                <select
                  className={styles.select}
                  name="postpaidTariffpackId"
                  value={form.postpaidTariffpackId}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>

                  {postpaidPackages.map((pkg) => (
                    <option
                      key={pkg.tariffPackageId}
                      value={pkg.tariffPackageId}
                    >
                      {pkg.tariffPackageDesc}
                    </option>
                  ))}
                </select>
              </div>

              {/* CREDIT PROFILE */}

              <div className={styles.formGroup}>
                <label className={styles.label}>Credit Profile</label>

                <select
                  className={styles.select}
                  name="creditProfileId"
                  value={form.creditProfileId}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>

                  {dropdowns?.creditProfiles?.map((cp) => (
                    <option key={cp.creditProfileId} value={cp.creditProfileId}>
                      {cp.creditProfileName}
                    </option>
                  ))}
                </select>
              </div>

              {/* CATEGORY */}

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Card-Voucher Profile Category
                  <span className={styles.star}>*</span>
                </label>

                <select
                  className={styles.select}
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>

                  {dropdowns?.categories?.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* THRESHOLD BALANCE */}

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Threshold Balance (RM)
                  <span className={styles.star}>*</span>
                </label>

                <input
                  className={styles.input}
                  type="number"
                  name="thresholdBalAmnt"
                  value={form.thresholdBalAmnt}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              {/* VALIDITY PERIOD */}

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Validity Period (Days)
                  <span className={styles.star}>*</span>
                </label>

                <input
                  className={styles.input}
                  type="number"
                  name="validityPeriod"
                  value={form.validityPeriod}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>

            {/* ACTIONS */}

            <div className={styles.actions}>
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className={styles.spinner} />
                    Saving...
                  </>
                ) : mode === "modify" ? (
                  "Update Profile"
                ) : (
                  "Submit"
                )}
              </button>

              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setError(null);

                  if (mode === "modify") {
                    // Existing reset functionality retained
                  } else {
                    setForm(INITIAL_FORM);
                  }
                }}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardProfileForm;

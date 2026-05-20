import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    showSuccess,
    showError,
} from "@/utils/toast";

import styles from "../styles/ManageIntegrators.module.css";

import {
    createIntegratorService,
    modifyIntegratorService,
} from "@/services/SessionServices/integratorMgmtServices/IntegratorMgmtService";

import {
    clearIntegratorSubmitState,
    fetchBusinessTypesThunk,
    fetchBanksThunk,
    selectBusinessTypes,
    selectBanks,
} from "@/store/slices/plmnSlices/integratorMgmtSlice";

import {
    fetchCountries,
    selectCountryOptions,
} from "@/store/slices/plmnSlices/countriesSlice";

import {
    fetchStates,
    selectStatesData,
} from "@/store/slices/plmnSlices/statesSlice";

const IntegratorCreateModifyForm = ({
    mode = "create",
    initialData = {},
    officeCode,
    onSuccess,
}) => {
    const dispatch = useDispatch();

    const [form, setForm] = useState({
        officeName: "",
        address: "",
        city: "",
        state: "",
        country: "IN",
        postalCode: "",
        emailId: "",
        phoneNo: "",
        officeManagerName: "",
        companyRegistrationNo: "",
        bankName: "",
        bankAccountHolderName: "",
        bankAccountNumber: "",
        typeOfBusiness: "",
        gstRegistrationNo: "",
        nir: 1,
        ...initialData,
    });

    const countries = useSelector(selectCountryOptions);
    const states = useSelector(selectStatesData);

    const businessTypes = useSelector(selectBusinessTypes);
    const banks = useSelector(selectBanks);

    const {
        submitting,
        submitSuccess,
        submitError,
    } = useSelector((state) => state.integratorMgmt);

    useEffect(() => {
        dispatch(fetchCountries());
        dispatch(fetchStates());

        dispatch(fetchBusinessTypesThunk());
        dispatch(fetchBanksThunk());
    }, [dispatch]);

    useEffect(() => {
        if (initialData) {
            setForm((prev) => ({
                ...prev,
                ...initialData,
            }));
        }
    }, [initialData]);

    useEffect(() => {
        if (submitSuccess === "true") {
            onSuccess?.();
        }
    }, [submitSuccess, onSuccess]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRadio = (value) => {
        setForm((prev) => ({
            ...prev,
            nir: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            levelNo: 3,
            officeName: form.officeName,
            address: form.address,
            city: form.city,
            state: form.state,
            country: form.country,
            postalCode: form.postalCode,
            emailId: form.emailId,
            phoneNo: form.phoneNo,
            parentEntCode: 1002,
            officeManagerName: form.officeManagerName,
            creditLimit: 10000,
            networkId: 1,
            planId: 10,
            depositAmount: 5000,
            companyRegistrationNo: form.companyRegistrationNo,
            bankName: form.bankName,
            bankAccountHolderName: form.bankAccountHolderName,
            bankAccountNumber: form.bankAccountNumber,
            typeOfBusiness: form.typeOfBusiness,
            gstRegistrationNo: form.gstRegistrationNo,
            nir: Number(form.nir),
        };

        let response;

        if (mode === "create") {
            response =
                await createIntegratorService(
                    dispatch,
                    payload
                );
        } else {
            response =
                await modifyIntegratorService(
                    dispatch,
                    officeCode,
                    {
                        ...payload,
                        officeCode,
                        statusCode: "AC",
                    }
                );
        }

        if (response?.payload?.errorCode === 0) {
            showSuccess(
                response?.payload?.message ||
                (mode === "create"
                    ? "Integrator created successfully"
                    : "Integrator modified successfully")
            );
        } else {
            showError(
                response?.payload?.message ||
                "Something went wrong"
            );
        }
    };

    const isSubmitDisabled = Boolean(submitting);

    return (
        <form
            className={styles.formGrid}
            onSubmit={handleSubmit}
        >
            <div className={`${styles.fieldGroup} ${styles.requiredField}`}>
                <label>Integrator Name</label>

                <input
                    type="text"
                    name="officeName"
                    value={form.officeName || ""}
                    onChange={handleChange}
                />
            </div>

            <div className={`${styles.fieldGroup} ${styles.requiredField}`}>
                <label>Address</label>

                <input
                    type="text"
                    name="address"
                    value={form.address || ""}
                    onChange={handleChange}
                />
            </div>

            <div className={`${styles.fieldGroup} ${styles.requiredField}`}>
                <label>City</label>

                <input
                    type="text"
                    name="city"
                    value={form.city || ""}
                    onChange={handleChange}
                />
            </div>

            <div className={`${styles.fieldGroup} ${styles.requiredField}`}>
                <label>Country</label>

                <select
                    name="country"
                    value={form.country || ""}
                    onChange={handleChange}
                >
                    <option value="">
                        Select Country
                    </option>

                    {countries?.map((country) => (
                        <option
                            key={country.value}
                            value={country.value}
                        >
                            {country.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.fieldGroup}>
                <label>State</label>

                <select
                    name="state"
                    value={form.state || ""}
                    onChange={handleChange}
                >
                    <option value="">
                        Select State
                    </option>

                    {states?.map((state) => (
                        <option
                            key={state.stateCode}
                            value={state.stateCode}
                        >
                            {state.stateDesc}
                        </option>
                    ))}
                </select>
            </div>

            <div className={`${styles.fieldGroup} ${styles.requiredField}`}>
                <label>Postal Code</label>

                <input
                    type="text"
                    name="postalCode"
                    value={form.postalCode || ""}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.fieldGroup}>
                <label>Email ID</label>

                <input
                    type="email"
                    name="emailId"
                    value={form.emailId || ""}
                    onChange={handleChange}
                />
            </div>

            <div className={`${styles.fieldGroup} ${styles.requiredField}`}>
                <label>Phone No</label>

                <input
                    type="text"
                    name="phoneNo"
                    value={form.phoneNo || ""}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.fieldGroup}>
                <label>Manager</label>

                <input
                    type="text"
                    name="officeManagerName"
                    value={form.officeManagerName || ""}
                    onChange={handleChange}
                />
            </div>

            <div className={`${styles.fieldGroup} ${styles.requiredField}`}>
                <label>
                    Company Registration Number
                </label>

                <input
                    type="text"
                    name="companyRegistrationNo"
                    value={form.companyRegistrationNo || ""}
                    onChange={handleChange}
                />
            </div>

            <div className={`${styles.fieldGroup} ${styles.requiredField}`}>
                <label>Type Of Business</label>

                <select
                    name="typeOfBusiness"
                    value={form.typeOfBusiness || ""}
                    onChange={handleChange}
                >
                    <option value="">
                        Select Business Type
                    </option>

                    {businessTypes?.map((item) => (
                        <option
                            key={item.business_type}
                            value={item.business_description}
                        >
                            {item.business_description}
                        </option>
                    ))}
                </select>
            </div>

            <div className={`${styles.fieldGroup} ${styles.requiredField}`}>
                <label>Bank Name</label>

                <select
                    name="bankName"
                    value={form.bankName || ""}
                    onChange={handleChange}
                >
                    <option value="">
                        Select Bank
                    </option>

                    {banks?.map((item) => (
                        <option
                            key={item.bank_id}
                            value={item.bank_name}
                        >
                            {item.bank_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={`${styles.fieldGroup} ${styles.requiredField}`}>
                <label>
                    Bank Account Holder Name
                </label>

                <input
                    type="text"
                    name="bankAccountHolderName"
                    value={form.bankAccountHolderName || ""}
                    onChange={handleChange}
                />
            </div>

            <div className={`${styles.fieldGroup} ${styles.requiredField}`}>
                <label>Bank Account Number</label>

                <input
                    type="text"
                    name="bankAccountNumber"
                    value={form.bankAccountNumber || ""}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.fieldGroup}>
                <label>GST Registration No</label>

                <input
                    type="text"
                    name="gstRegistrationNo"
                    value={form.gstRegistrationNo || ""}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.fieldGroup}>
                <label>NIR Code</label>

                <div className={styles.radioGroup}>
                    <label>
                        <input
                            type="radio"
                            checked={Number(form.nir) === 1}
                            onChange={() => handleRadio(1)}
                        />
                        Yes
                    </label>

                    <label>
                        <input
                            type="radio"
                            checked={Number(form.nir) === 0}
                            onChange={() => handleRadio(0)}
                        />
                        No
                    </label>
                </div>
            </div>

            <div className={styles.formActions}>
                <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() =>
                        dispatch(
                            clearIntegratorSubmitState()
                        )
                    }
                >
                    Reset
                </button>

                <button
                    type="submit"
                    className={
                        isSubmitDisabled
                            ? `${styles.primaryBtn} ${styles.primaryBtnDisabled}`
                            : styles.primaryBtn
                    }
                    disabled={isSubmitDisabled}
                >
                    {submitting
                        ? "Submitting..."
                        : mode === "create"
                            ? "Create Integrator"
                            : "Modify Integrator"}
                </button>
            </div>
        </form>
    );
};

export default IntegratorCreateModifyForm;
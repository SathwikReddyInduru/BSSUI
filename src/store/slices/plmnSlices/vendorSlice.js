import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { loadConfig } from "../../../services/configService";

let cachedConfigPromise = null;

async function getApiConfig() {
    if (!cachedConfigPromise) cachedConfigPromise = loadConfig();
    return cachedConfigPromise;
}

// ─── GET ALL vendors ─────────────────────────
export const fetchVendors = createAsyncThunk(
    'vendor/fetchAll',
    async (networkId, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.get(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/goods-receipt/vendors`,
                { params: { networkId } }
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch vendors');
        }
    }
);

// ─── GET BY ID ─────────────────────────
export const fetchVendor = createAsyncThunk(
    'vendor/fetchOne',
    async (vendorCode, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.get(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/goods-receipt/${vendorCode}`
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch vendor');
        }
    }
);

// ─── CREATE ─────────────────────────
export const createVendor = createAsyncThunk(
    'vendor/create',
    async (payload, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.post(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/goods-receipt/create`,
                payload
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// ─── UPDATE ─────────────────────────
export const modifyVendor = createAsyncThunk(
    'vendor/modify',
    async (payload, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.put(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/goods-receipt/update`,
                payload
            );
            // API may return updated object or just a success message; fall back to payload
            return res.data ?? payload;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// ─── GET POs BY VENDOR ─────────────────────────
export const fetchVendorPOs = createAsyncThunk(
    'vendor/fetchVendorPOs',
    async (vendorCode, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.get(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/goods-receipt/${vendorCode}/pos`
            );
            return Array.isArray(res.data) ? res.data : [];
        } catch (err) {
            const status = err.response?.status;
            // 400/404 simply means no POs exist for this vendor — not a real error
            if (status === 400 || status === 404) return [];
            return rejectWithValue(err.message || 'Failed to fetch POs');
        }
    }
);

// ─── SET COMMERCIAL PRICES ─────────────────────────
export const setPrices = createAsyncThunk(
    'vendor/setPrices',
    async (payload, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.post(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/goods-receipt/set-prices`,
                payload
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to set prices');
        }
    }
);

// ─── SUBMIT GR ─────────────────────────
export const submitGR = createAsyncThunk(
    'vendor/submitGR',
    async (payload, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.post(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/goods-receipt/submit`,
                payload
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to submit goods receipt');
        }
    }
);

// ─── GET VOUCHER SERIALS BY PO (all statuses — GN, SL, RJ, etc.) ───
export const fetchVoucherSerials = createAsyncThunk(
    'vendor/fetchVoucherSerials',
    async (poNo, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.get(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/goods-receipt/gn/${poNo}`
            );
            return Array.isArray(res.data) ? res.data : [];
        } catch (err) {
            const status = err.response?.status;
            if (status === 400 || status === 404) return [];
            return rejectWithValue(err.message || 'Failed to fetch voucher serials');
        }
    }
);

// ─── GET GR SUMMARY ─────────────────────────
export const fetchGRSummary = createAsyncThunk(
    'vendor/fetchGRSummary',
    async (poNo, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.get(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/goods-receipt/summary/${poNo}`
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch summary');
        }
    }
);

const vendorSlice = createSlice({
    name: 'vendor',
    initialState: {
        list: [],
        selected: null,
        loading: false,
        selectedLoading: false,
        submitting: false,
        error: null,
        submitSuccess: false,
        submitError: null,
        summary: null,
        summaryLoading: false,
        summaryError: null,
        grSubmitting: false,
        grSubmitSuccess: false,
        grSubmitError: null,
        poList: [],
        poLoading: false,
        poError: null,
        voucherSerials: [],
        voucherSerialsLoading: false,
        voucherSerialsError: null,
    },
    reducers: {
        clearSubmitState: (state) => {
            state.submitSuccess = false;
            state.submitError = null;
        },
        clearGRSubmitState: (state) => {
            state.grSubmitSuccess = false;
            state.grSubmitError = null;
        },
        clearSelected: (state) => {
            state.selected = null;
        },
        clearPoList: (state) => {
            state.poList = [];
            state.poError = null;
        },
        clearVoucherSerials: (state) => {
            state.voucherSerials = [];
            state.voucherSerialsError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ── fetchVendors ──
            .addCase(fetchVendors.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchVendors.fulfilled, (s, a) => {
                s.loading = false;
                s.list = a.payload;
            })
            .addCase(fetchVendors.rejected, (s, a) => {
                s.loading = false;
                s.error = a.payload;
            })

            // ── fetchVendor (by id) ──
            .addCase(fetchVendor.pending, (s) => { s.selectedLoading = true; })
            .addCase(fetchVendor.fulfilled, (s, a) => {
                s.selectedLoading = false;
                s.selected = a.payload;
            })
            .addCase(fetchVendor.rejected, (s) => { s.selectedLoading = false; })

            // ── createVendor ──
            .addCase(createVendor.pending, (s) => { s.submitting = true; s.submitError = null; })
            .addCase(createVendor.fulfilled, (s, a) => {
                s.submitting = false;
                s.submitSuccess = true;
                if (a.payload && typeof a.payload === 'object') {
                    s.list.unshift(a.payload);
                }
            })
            .addCase(createVendor.rejected, (s, a) => {
                s.submitting = false;
                s.submitError = a.payload;
            })

            // ── modifyVendor ──
            .addCase(modifyVendor.pending, (s) => { s.submitting = true; s.submitError = null; })
            .addCase(modifyVendor.fulfilled, (s, a) => {
                s.submitting = false;
                s.submitSuccess = true;
                const updated = a.payload;
                if (updated?.vendorCode) {
                    const idx = s.list.findIndex(v => v.vendorCode === updated.vendorCode);
                    if (idx !== -1) s.list[idx] = { ...s.list[idx], ...updated };
                }
            })
            .addCase(modifyVendor.rejected, (s, a) => {
                s.submitting = false;
                s.submitError = a.payload;
            })

            // ── fetchVendorPOs ──
            .addCase(fetchVendorPOs.pending, (s) => { s.poLoading = true; s.poError = null; })
            .addCase(fetchVendorPOs.fulfilled, (s, a) => {
                s.poLoading = false;
                s.poList = a.payload;
            })
            .addCase(fetchVendorPOs.rejected, (s, a) => {
                s.poLoading = false;
                s.poError = a.payload;
                s.poList = [];
            })

            // ── fetchGRSummary ──
            .addCase(fetchGRSummary.pending, (s) => {
                s.summaryLoading = true;
            })
            .addCase(fetchGRSummary.fulfilled, (s, a) => {
                s.summaryLoading = false;
                s.summary = a.payload;
            })
            .addCase(fetchGRSummary.rejected, (s, a) => {
                s.summaryLoading = false;
                s.summaryError = a.payload;
            })

            // ── fetchVoucherSerials ──
            .addCase(fetchVoucherSerials.pending, (s) => { s.voucherSerialsLoading = true; s.voucherSerialsError = null; })
            .addCase(fetchVoucherSerials.fulfilled, (s, a) => {
                s.voucherSerialsLoading = false;
                s.voucherSerials = a.payload;
            })
            .addCase(fetchVoucherSerials.rejected, (s, a) => {
                s.voucherSerialsLoading = false;
                s.voucherSerialsError = a.payload;
                s.voucherSerials = [];
            })

            // ── submitGR ──
            .addCase(submitGR.pending, (s) => { s.grSubmitting = true; s.grSubmitError = null; })
            .addCase(submitGR.fulfilled, (s, a) => {
                s.grSubmitting = false;
                s.grSubmitSuccess = true;
            })
            .addCase(submitGR.rejected, (s, a) => {
                s.grSubmitting = false;
                s.grSubmitError = a.payload;
            })
    }
});

export const { clearSubmitState, clearSelected, clearPoList, clearGRSubmitState, clearVoucherSerials } = vendorSlice.actions;
export default vendorSlice.reducer;
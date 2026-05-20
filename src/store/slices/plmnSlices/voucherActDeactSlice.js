import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { loadConfig } from "../../../services/configService";

let cachedConfigPromise = null;
async function getApiConfig() {
    if (!cachedConfigPromise) cachedConfigPromise = loadConfig();
    return cachedConfigPromise;
}

// ─── Helper — turns FAILED body into a structured rejection ───────────────────
// The API returns HTTP 200 even for logical failures, detected via res.data.status
const buildFailedError = (data, action) => {
    const count = data.voucherSerialNumbers?.length ?? 0;
    const actionLabel = action === 'activate' ? 'activated' : 'deactivated';
    if (count > 0) {
        return {
            message: `${count} voucher${count !== 1 ? 's' : ''} could not be ${actionLabel} — invalid or incompatible status.`,
            failedSerials: data.voucherSerialNumbers,
        };
    }
    return {
        message: data.reason || data.message || `Failed to ${action} vouchers`,
        failedSerials: [],
    };
};

// ─── ACTIVATE VOUCHERS ────────────────────────────────────────────────────────
export const activateVouchers = createAsyncThunk(
    'voucherActivation/activate',
    async (payload, { rejectWithValue }) => {
        // payload: { vouchers: string[], remarks: string, loginId: string, networkId: number }
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.post(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/vouchers/activate`,
                payload
            );
            // HTTP 200 but logically FAILED
            if (res.data?.status === 'FAILED') {
                return rejectWithValue(buildFailedError(res.data, 'activate'));
            }
            return res.data;
        } catch (err) {
            const data = err.response?.data;
            if (data?.status === 'FAILED') {
                return rejectWithValue(buildFailedError(data, 'activate'));
            }
            return rejectWithValue({
                message: data?.message || err.message || 'Failed to activate vouchers',
                failedSerials: [],
            });
        }
    }
);

// ─── DEACTIVATE VOUCHERS ──────────────────────────────────────────────────────
export const deactivateVouchers = createAsyncThunk(
    'voucherActivation/deactivate',
    async (payload, { rejectWithValue }) => {
        // payload: { vouchers: string[], remarks: string, loginId: string, networkId: number }
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.post(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/vouchers/deactivate`,
                payload
            );
            if (res.data?.status === 'FAILED') {
                return rejectWithValue(buildFailedError(res.data, 'deactivate'));
            }
            return res.data;
        } catch (err) {
            const data = err.response?.data;
            if (data?.status === 'FAILED') {
                return rejectWithValue(buildFailedError(data, 'deactivate'));
            }
            return rejectWithValue({
                message: data?.message || err.message || 'Failed to deactivate vouchers',
                failedSerials: [],
            });
        }
    }
);

// ─── SLICE ────────────────────────────────────────────────────────────────────
const voucherActDeactSlice = createSlice({
    name: 'voucherActDeact',
    initialState: {
        submitting: false,
        submitSuccess: false,
        submitError: null,       // string — human-readable message
        failedSerials: [],       // string[] — from FAILED response e.g. ["7300339518 (DA)"]
        processedCount: 0,       // from SUCCESS response
        lastAction: null,        // 'activate' | 'deactivate' | null
    },
    reducers: {
        clearActivationState: (state) => {
            state.submitting = false;
            state.submitSuccess = false;
            state.submitError = null;
            state.failedSerials = [];
            state.processedCount = 0;
            state.lastAction = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ── activateVouchers ──
            .addCase(activateVouchers.pending, (state) => {
                state.submitting = true;
                state.submitSuccess = false;
                state.submitError = null;
                state.failedSerials = [];
                state.processedCount = 0;
                state.lastAction = 'activate';
            })
            .addCase(activateVouchers.fulfilled, (state, action) => {
                state.submitting = false;
                state.submitSuccess = true;
                state.processedCount = action.payload?.processedCount ?? 0;
            })
            .addCase(activateVouchers.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload?.message ?? 'Failed to activate vouchers';
                state.failedSerials = action.payload?.failedSerials ?? [];
            })

            // ── deactivateVouchers ──
            .addCase(deactivateVouchers.pending, (state) => {
                state.submitting = true;
                state.submitSuccess = false;
                state.submitError = null;
                state.failedSerials = [];
                state.processedCount = 0;
                state.lastAction = 'deactivate';
            })
            .addCase(deactivateVouchers.fulfilled, (state, action) => {
                state.submitting = false;
                state.submitSuccess = true;
                state.processedCount = action.payload?.processedCount ?? 0;
            })
            .addCase(deactivateVouchers.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload?.message ?? 'Failed to deactivate vouchers';
                state.failedSerials = action.payload?.failedSerials ?? [];
            });
    },
});

export const { clearActivationState } = voucherActDeactSlice.actions;
export default voucherActDeactSlice.reducer;
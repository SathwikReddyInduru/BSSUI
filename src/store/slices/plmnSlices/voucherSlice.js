import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { loadConfig } from "../../../services/configService";

let cachedConfigPromise = null;

async function getApiConfig() {
    if (!cachedConfigPromise) cachedConfigPromise = loadConfig();
    return cachedConfigPromise;
}

// ── Async Thunk ──────────────────────────────────────────────
export const fetchDashboardData = createAsyncThunk(
    'voucher/fetchDashboardData',
    async (_, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.get(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/voucherprofile/dashboard`
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message ||
                err.message ||
                'Failed to fetch dashboard data'
            );
        }
    }
);

// ── Slice ────────────────────────────────────────────────────
const voucherSlice = createSlice({
    name: 'voucher',
    initialState: {
        dashboard: {
            stats: null,
            recentVoucherProfiles: [],
        },
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                // Map flat API response into stats object
                const { preparedVouchers, gnStock, slStock, usStock, voucherProfiles } = action.payload;
                state.dashboard.stats = { preparedVouchers, gnStock, slStock, usStock };
                state.dashboard.recentVoucherProfiles = voucherProfiles ?? [];
            })
            .addCase(fetchDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default voucherSlice.reducer;
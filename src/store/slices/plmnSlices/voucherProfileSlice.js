import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { loadConfig } from "../../../services/configService";

let cachedConfigPromise = null;

async function getApiConfig() {
    if (!cachedConfigPromise) cachedConfigPromise = loadConfig();
    return cachedConfigPromise;
}

// GET ALL
export const fetchProfiles = createAsyncThunk(
    'voucherProfile/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.get(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/voucherprofile`
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message ||
                err.message ||
                'Failed to fetch profiles'
            );
        }
    }
);

// GET BY ID
export const fetchProfile = createAsyncThunk(
    'voucherProfile/fetchById',
    async (voucherProfileId, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.get(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/voucherprofile/${voucherProfileId}`
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message ||
                err.message ||
                'Failed to fetch profile'
            );
        }
    }
);

// FETCH DROPDOWNS (tariffPackages + categories) by networkId
export const fetchDropdowns = createAsyncThunk(
    'voucherProfile/fetchDropdowns',
    async (networkId, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.get(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/voucherprofile/dropdowns/network/${networkId}`
            );
            return {
                tariffPackages: res.data.tariffPackages ?? [],
                categories: res.data.categories ?? [],
            };
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message ||
                err.message ||
                'Failed to fetch dropdown options'
            );
        }
    }
);

// CREATE
export const createProfile = createAsyncThunk(
    'voucherProfile/create',
    async (payload, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.post(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/voucherprofile`,
                payload,
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            if (res.data === 'Duplicate profile') {
                return rejectWithValue('A profile with this name already exists.');
            }

            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message ||
                err.message ||
                'Failed to create profile'
            );
        }
    }
);

// UPDATE
export const modifyProfile = createAsyncThunk(
    'voucherProfile/modify',
    async ({ voucherProfileId, ...payload }, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.put(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/voucherprofile/${voucherProfileId}`,
                payload,
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            if (res.data === 'Not found') {
                return rejectWithValue('Profile not found.');
            }

            return { voucherProfileId, ...payload };
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message ||
                err.message ||
                'Failed to update profile'
            );
        }
    }
);

// APPROVE / REJECT (single endpoint, flag-based)
export const approveProfile = createAsyncThunk(
    'voucherProfile/approve',
    async ({ voucherProfileId, approveFlag, loginId }, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.post(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/voucherprofile/approve-reject`,
                { voucherProfileId, approveFlag, loginId },
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (res.data === 'Error') return rejectWithValue('Operation failed on server.');
            // Return the response message so the UI can display it
            return { voucherProfileId, approveFlag, message: res.data };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message || 'Failed to approve profile');
        }
    }
);

export const rejectProfile = createAsyncThunk(
    'voucherProfile/reject',
    async ({ voucherProfileId, approveFlag, loginId }, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();
            const res = await axios.post(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/voucherprofile/approve-reject`,
                { voucherProfileId, approveFlag, loginId },
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (res.data === 'Error') return rejectWithValue('Operation failed on server.');
            return { voucherProfileId, approveFlag, message: res.data };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message || 'Failed to reject profile');
        }
    }
);

const voucherProfileSlice = createSlice({
    name: 'voucherProfile',

    initialState: {
        list: [],
        selectedProfile: null,
        loading: false,
        submitting: false,
        error: null,
        submitError: null,
        submitSuccess: false,
        approveRejectSuccess: false,
        approveRejectError: null,

        // dropdown state
        dropdowns: {
            tariffPackages: [],
            categories: [],
        },
        dropdownsLoading: false,
        dropdownsError: null,
    },

    reducers: {
        clearSubmitState(state) {
            state.submitError = null;
            state.submitSuccess = false;
        },
        clearDropdownsError(state) {
            state.dropdownsError = null;
        },
        clearApproveRejectState(state) {
            state.approveRejectSuccess = false;
            state.approveRejectError = null;
        },
    },

    extraReducers: (builder) => {
        builder

            // ── FETCH ALL ──────────────────────────────────────
            .addCase(fetchProfiles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfiles.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchProfiles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ── FETCH BY ID ────────────────────────────────────
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedProfile = action.payload;

                const idx = state.list.findIndex(
                    (p) => p.voucherProfileId === action.payload.voucherProfileId
                );
                if (idx !== -1) state.list[idx] = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ── FETCH DROPDOWNS ────────────────────────────────
            .addCase(fetchDropdowns.pending, (state) => {
                state.dropdownsLoading = true;
                state.dropdownsError = null;
            })
            .addCase(fetchDropdowns.fulfilled, (state, action) => {
                state.dropdownsLoading = false;
                state.dropdowns.tariffPackages = action.payload.tariffPackages;
                state.dropdowns.categories = action.payload.categories;
            })
            .addCase(fetchDropdowns.rejected, (state, action) => {
                state.dropdownsLoading = false;
                state.dropdownsError = action.payload;
            })

            // ── CREATE ─────────────────────────────────────────
            .addCase(createProfile.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
                state.submitSuccess = false;
            })
            .addCase(createProfile.fulfilled, (state) => {
                state.submitting = false;
                state.submitSuccess = true;
            })
            .addCase(createProfile.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            })

            // ── MODIFY ─────────────────────────────────────────
            .addCase(modifyProfile.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
                state.submitSuccess = false;
            })
            .addCase(modifyProfile.fulfilled, (state, action) => {
                state.submitting = false;
                state.submitSuccess = true;

                const idx = state.list.findIndex(
                    (p) => p.voucherProfileId === action.payload.voucherProfileId
                );
                if (idx !== -1) state.list[idx] = action.payload;
            })
            .addCase(modifyProfile.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            })

            // ── APPROVE ────────────────────────────────────────
            .addCase(approveProfile.pending, (state) => {
                state.approveRejectError = null;
                state.approveRejectSuccess = false;
            })
            .addCase(approveProfile.fulfilled, (state, action) => {
                state.approveRejectSuccess = true;
                // Optimistically update status in list
                const idx = state.list.findIndex(p => p.voucherProfileId === action.payload.voucherProfileId);
                if (idx !== -1) state.list[idx] = { ...state.list[idx], status: 'A' };
            })
            .addCase(approveProfile.rejected, (state, action) => {
                state.approveRejectError = action.payload;
            })

            // ── REJECT ─────────────────────────────────────────
            .addCase(rejectProfile.pending, (state) => {
                state.approveRejectError = null;
                state.approveRejectSuccess = false;
            })
            .addCase(rejectProfile.fulfilled, (state, action) => {
                state.approveRejectSuccess = true;
                // Optimistically update status in list
                const idx = state.list.findIndex(p => p.voucherProfileId === action.payload.voucherProfileId);
                if (idx !== -1) state.list[idx] = { ...state.list[idx], status: 'R' };
            })
            .addCase(rejectProfile.rejected, (state, action) => {
                state.approveRejectError = action.payload;
            });
    },
});

export const { clearSubmitState, clearDropdownsError, clearApproveRejectState } = voucherProfileSlice.actions;
export default voucherProfileSlice.reducer;
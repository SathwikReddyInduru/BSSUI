import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { loadConfig } from "../../../services/configService";

let cachedConfigPromise = null;

async function getApiConfig() {
    if (!cachedConfigPromise) {
        cachedConfigPromise = loadConfig();
    }
    return cachedConfigPromise;
}

// ── Fetch Categories ─────────────────────────────

export const fetchCategories = createAsyncThunk(
    'voucherCategory/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();

            const res = await axios.get(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/category/all`
            );

            return res.data;
        } catch (err) {
            console.error('fetchCategories error:', err);
            return rejectWithValue(
                err.response?.data?.message ||
                err.message ||
                'Failed to fetch categories'
            );
        }
    }
);

// ── Create Category ─────────────────────────────

export const createCategory = createAsyncThunk(
    'voucherCategory/create',
    async (payload, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();

            const res = await axios.post(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/category/create`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            return res.data;
        } catch (err) {
            console.error('createCategory error:', err);
            return rejectWithValue(
                err.response?.data?.message ||
                err.message ||
                'Failed to create category'
            );
        }
    }
);

// ── Modify Category ─────────────────────────────

export const modifyCategory = createAsyncThunk(
    'voucherCategory/modify',
    async ({ categoryId, categoryDesc }, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();

            const res = await axios.put(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/category/update-desc/${categoryId}`,
                { categoryDesc },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            return res.data;
        } catch (err) {
            console.error('modifyCategory error:', err);
            return rejectWithValue(
                err.response?.data?.message ||
                err.message ||
                'Failed to update category'
            );
        }
    }
);

// ── Slice ───────────────────────────────────────

const voucherCategorySlice = createSlice({
    name: 'voucherCategory',
    initialState: {
        list: [],
        loading: false,
        submitting: false,
        error: null,
        submitError: null,
        submitSuccess: false,
    },

    reducers: {
        clearSubmitState(state) {
            state.submitError = null;
            state.submitSuccess = false;
        },
    },

    extraReducers: (builder) => {
        builder

            // Fetch
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create
            .addCase(createCategory.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
                state.submitSuccess = false;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.submitting = false;
                state.submitSuccess = true;
                state.list.push(action.payload);
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            })

            // Modify
            .addCase(modifyCategory.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
                state.submitSuccess = false;
            })
            .addCase(modifyCategory.fulfilled, (state, action) => {
                state.submitting = false;
                state.submitSuccess = true;

                const idx = state.list.findIndex(
                    (c) => c.categoryId === action.payload.categoryId
                );

                if (idx !== -1) {
                    state.list[idx] = action.payload;
                }
            })
            .addCase(modifyCategory.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            });
    },
});

export const { clearSubmitState } = voucherCategorySlice.actions;

export default voucherCategorySlice.reducer;
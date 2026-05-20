import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosService from "@/services/AxiosService";
import { loadConfig } from "@/services/configService";

// ─── Config cache ─────────────────────────
let cachedConfigPromise = null;

async function getApiConfig() {
    if (!cachedConfigPromise) {
        cachedConfigPromise = loadConfig();
    }

    return cachedConfigPromise;
}

/* =========================================
   FETCH ALL INTEGRATORS
========================================= */

export const fetchIntegratorsThunk = createAsyncThunk(
    "integratorMgmt/fetchIntegrators",
    async (networkId, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();

            const endpoint =
                `${apiConfig.api.endpoints.integrators_API}?networkId=${networkId}`;

            const response = await axiosService.get(endpoint);

            return Array.isArray(response.data)
                ? response.data
                : [];

        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    errorCode: 500,
                    message: "Failed to fetch integrators",
                }
            );
        }
    }
);

/* =========================================
   CREATE INTEGRATOR
========================================= */

export const createIntegratorThunk = createAsyncThunk(
    "integratorMgmt/createIntegrator",
    async (payload, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();

            const endpoint =
                apiConfig.api.endpoints.createIntegrator_API;

            const response = await axiosService.post(
                endpoint,
                payload
            );

            return response.data;

        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    errorCode: "500",
                    message: "Failed to create integrator",
                }
            );
        }
    }
);

/* =========================================
   MODIFY INTEGRATOR
========================================= */

export const modifyIntegratorThunk = createAsyncThunk(
    "integratorMgmt/modifyIntegrator",
    async (payload, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();

            const endpoint =
                apiConfig.api.endpoints.modifyIntegrator_API;

            const response = await axiosService.post(
                endpoint,
                payload
            );

            return response.data;

        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    errorCode: "500",
                    message: "Failed to modify integrator",
                }
            );
        }
    }
);

/* =========================================
   FETCH BUSINESS TYPES
========================================= */

export const fetchBusinessTypesThunk = createAsyncThunk(
    "integratorMgmt/fetchBusinessTypes",
    async (_, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();

            const endpoint =
                apiConfig.api.endpoints.businessTypes_API;

            const response =
                await axiosService.get(endpoint);

            return response.data;

        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    errorCode: "500",
                    message:
                        "Failed to fetch business types",
                }
            );
        }
    }
);

/* =========================================
   FETCH BANKS
========================================= */

export const fetchBanksThunk = createAsyncThunk(
    "integratorMgmt/fetchBanks",
    async (_, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();

            const endpoint =
                apiConfig.api.endpoints.banks_API;

            const response =
                await axiosService.get(endpoint);

            return response.data;

        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    errorCode: "500",
                    message:
                        "Failed to fetch banks",
                }
            );
        }
    }
);

/* =========================================
   INITIAL STATE
========================================= */

const initialState = {
    loading: false,

    integrators: [],

    error: null,

    businessTypes: [],
    banks: [],

    submitting: false,
    submitSuccess: "idle",
    submitError: null,

    createResponse: null,
    modifyResponse: null,
};

/* =========================================
   SLICE
========================================= */

const integratorMgmtSlice = createSlice({
    name: "integratorMgmt",

    initialState,

    reducers: {
        clearIntegratorSubmitState: (state) => {
            state.submitting = false;
            state.submitSuccess = "idle";
            state.submitError = null;

            state.createResponse = null;
            state.modifyResponse = null;
        },

        clearIntegrators: (state) => {
            state.integrators = [];
            state.error = null;
            state.loading = false;
        },
    },

    extraReducers: (builder) => {
        builder

            /* =========================================
               FETCH INTEGRATORS
            ========================================= */

            .addCase(fetchIntegratorsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchIntegratorsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.integrators = action.payload;
            })

            .addCase(fetchIntegratorsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.integrators = [];
            })

            /* =========================================
               BUSINESS TYPES
            ========================================= */

            .addCase(fetchBusinessTypesThunk.fulfilled, (state, action) => {
                state.businessTypes = action.payload || [];
            })

            /* =========================================
               BANKS
            ========================================= */

            .addCase(fetchBanksThunk.fulfilled, (state, action) => {
                state.banks = action.payload || [];
            })

            /* =========================================
               CREATE INTEGRATOR
            ========================================= */

            .addCase(createIntegratorThunk.pending, (state) => {
                state.submitting = true;
                state.submitSuccess = "idle";
                state.submitError = null;
                state.createResponse = null;
            })

            .addCase(createIntegratorThunk.fulfilled, (state, action) => {
                state.submitting = false;

                state.createResponse = action.payload;

                if (
                    String(action.payload?.errorCode) === "0"
                ) {
                    state.submitSuccess = "true";
                    state.submitError = null;
                } else {
                    state.submitSuccess = "false";
                    state.submitError = action.payload;
                }
            })

            .addCase(createIntegratorThunk.rejected, (state, action) => {
                state.submitting = false;
                state.submitSuccess = "false";
                state.submitError = action.payload;
            })

            /* =========================================
               MODIFY INTEGRATOR
            ========================================= */

            .addCase(modifyIntegratorThunk.pending, (state) => {
                state.submitting = true;
                state.submitSuccess = "idle";
                state.submitError = null;
                state.modifyResponse = null;
            })

            .addCase(modifyIntegratorThunk.fulfilled, (state, action) => {
                state.submitting = false;

                state.modifyResponse = action.payload;

                if (
                    String(action.payload?.errorCode) === "0"
                ) {
                    state.submitSuccess = "true";
                    state.submitError = null;
                } else {
                    state.submitSuccess = "false";
                    state.submitError = action.payload;
                }
            })

            .addCase(modifyIntegratorThunk.rejected, (state, action) => {
                state.submitting = false;
                state.submitSuccess = "false";
                state.submitError = action.payload;
            });
    },
});

export const {
    clearIntegratorSubmitState,
    clearIntegrators,
} = integratorMgmtSlice.actions;

/* =========================================
   SELECTORS
========================================= */

export const selectBusinessTypes = (state) =>
    state.integratorMgmt.businessTypes;

export const selectBanks = (state) =>
    state.integratorMgmt.banks;

export const selectIntegratorSubmitting = (state) =>
    state.integratorMgmt.submitting;

export const selectIntegratorSubmitSuccess = (state) =>
    state.integratorMgmt.submitSuccess;

export const selectIntegratorSubmitError = (state) =>
    state.integratorMgmt.submitError;

/* =========================================
   EXPORTS
========================================= */

export const integratorMgmtReducer =
    integratorMgmtSlice.reducer;

export default integratorMgmtSlice.reducer;
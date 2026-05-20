// src/store/slices/plmnSlices/integratorDetailsSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosService from "@/services/AxiosService";
import { loadConfig } from "@/services/configService";

// ─── Config cache ──────────────────────────────────────
let cachedConfigPromise = null;

async function getApiConfig() {
    if (!cachedConfigPromise) {
        cachedConfigPromise = loadConfig();
    }
    return cachedConfigPromise;
}

/* =========================================
   FETCH INTEGRATOR DETAILS
========================================= */

export const fetchIntegratorDetailsThunk = createAsyncThunk(
    "integratorDetails/fetchIntegratorDetails",
    async (officeCode, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();

            const endpoint = `${apiConfig.api.endpoints.integratorDetails_API}/${officeCode}`;

            const response = await axiosService.get(endpoint);

            return response.data;

        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    errorCode: 500,
                    message: "Failed to fetch integrator details",
                }
            );
        }
    }
);

/* =========================================
   SLICE
========================================= */

const integratorDetailsSlice = createSlice({
    name: "integratorDetails",

    initialState: {
        loading: false,
        integratorDtls: null,
        error: null,
    },

    reducers: {
        clearIntegratorDetails: (state) => {
            state.integratorDtls = null;
            state.error = null;
            state.loading = false;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchIntegratorDetailsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.integratorDtls = null;
            })
            .addCase(fetchIntegratorDetailsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.integratorDtls = action.payload;
            })
            .addCase(fetchIntegratorDetailsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.integratorDtls = null;
            });
    },
});

export const { clearIntegratorDetails } = integratorDetailsSlice.actions;

export const integratorDetailsReducer = integratorDetailsSlice.reducer;

export default integratorDetailsSlice.reducer;

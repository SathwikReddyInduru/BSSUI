import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { loadConfig } from "../../../services/configService";

let cachedConfigPromise = null;

async function getBaseUrl() {
    if (!cachedConfigPromise) cachedConfigPromise = loadConfig();
    const apiConfig = await cachedConfigPromise;
    return `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}`;
}

const getErrorMessage = (err, defaultMessage) =>
    err.response?.data?.message ||
    err.response?.data ||
    err.message ||
    defaultMessage;

// 🔍 Search one voucher by serial number
export const searchVoucher = createAsyncThunk(
    "voucherSearch/searchVoucher",
    async ({ voucherNo }, { rejectWithValue }) => {
        try {
            const baseUrl = await getBaseUrl();

            const response = await axios.get(`${baseUrl}/api/voucher/search`, {
                params: { voucherNo },
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(getErrorMessage(err, "Voucher search failed"));
        }
    }
);

// 📊 Fetch expired voucher profile summary
// 📊 Fetch expired voucher profile summary for Expired Vouchers tab
export const fetchExpiredProfiles = createAsyncThunk(
    "voucherSearch/fetchExpiredProfiles",
    async (_, { rejectWithValue }) => {
        try {
            const baseUrl = await getBaseUrl();

            const response = await axios.get(
                `${baseUrl}/api/voucher/expired/profiles`
            );

            return response.data;
        } catch (err) {
            return rejectWithValue(
                getErrorMessage(err, "Failed to fetch expired voucher profiles")
            );
        }
    }
);
// 📂 Generate expired voucher file
export const generateExpiredVoucherFile = createAsyncThunk(
    "voucherSearch/generateExpiredVoucherFile",
    async ({ profileId }, { rejectWithValue }) => {
        try {
            const baseUrl = await getBaseUrl();

            const response = await axios.post(
                `${baseUrl}/api/voucher/generate`,
                null,
                {
                    params: { profileId },
                    responseType: "blob",
                }
            );

            return response.data;
        } catch (err) {
            return rejectWithValue(
                getErrorMessage(err, "Failed to generate expired voucher file")
            );
        }
    }
);




const voucherSearchSlice = createSlice({
    name: "voucherSearch",

    initialState: {
        voucher: null,
        expiredProfiles: [],

        loading: false,
        expiredLoading: false,
        generating: false,

        error: null,
        expiredError: null,
        generateError: null,


    },


    reducers: {
        clearVoucher(state) {
            state.voucher = null;
            state.error = null;
        },

        clearVoucherSearchState(state) {
            state.voucher = null;
            state.expiredProfiles = [];
            state.error = null;
            state.expiredError = null;
            state.generateError = null;

        },
    },

    extraReducers: (builder) => {
        builder


            .addCase(searchVoucher.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.voucher = null;
            })
            .addCase(searchVoucher.fulfilled, (state, action) => {
                state.loading = false;
                state.voucher = action.payload;
            })
            .addCase(searchVoucher.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchExpiredProfiles.pending, (state) => {
                state.expiredLoading = true;
                state.expiredError = null;
            })
            .addCase(fetchExpiredProfiles.fulfilled, (state, action) => {
                state.expiredLoading = false;
                state.expiredProfiles = Array.isArray(action.payload)
                    ? action.payload
                    : [];
            })
            .addCase(fetchExpiredProfiles.rejected, (state, action) => {
                state.expiredLoading = false;
                state.expiredError = action.payload;
                state.expiredProfiles = [];
            })

            .addCase(generateExpiredVoucherFile.pending, (state) => {
                state.generating = true;
                state.generateError = null;
            })
            .addCase(generateExpiredVoucherFile.fulfilled, (state) => {
                state.generating = false;
            })
            .addCase(generateExpiredVoucherFile.rejected, (state, action) => {
                state.generating = false;
                state.generateError = action.payload;
            });


    },
});

export const { clearVoucher, clearVoucherSearchState } =
    voucherSearchSlice.actions;

export default voucherSearchSlice.reducer;
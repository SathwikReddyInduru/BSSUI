import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { loadConfig } from "../../../services/configService";

let cachedConfigPromise = null;

async function getApiConfig() {
    if (!cachedConfigPromise) {
        cachedConfigPromise = loadConfig();
    }
    return cachedConfigPromise;
}

async function getBaseUrl() {
    const apiConfig = await getApiConfig();
    return `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}`;
}

const getErrorMessage = (err, defaultMessage) => {
    return (
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        defaultMessage
    );
};

export const fetchPurchaseOrders = createAsyncThunk(
    "purchaseOrder/fetchPurchaseOrders",
    async ({ networkId, productType = "VOUCHER" }, { rejectWithValue }) => {
        try {
            if (!networkId) {
                return rejectWithValue("Network ID is missing. Please login again.");
            }

            const baseUrl = await getBaseUrl();

            const response = await axios.get(`${baseUrl}/api/approval-po/pending`, {
                params: {
                    networkId: Number(networkId),
                    productType,
                },
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(
                getErrorMessage(err, "Failed to fetch purchase orders")
            );
        }
    }
);

export const fetchPoVendors = createAsyncThunk(
    "purchaseOrder/fetchPoVendors",
    async (networkId, { rejectWithValue }) => {
        try {
            const baseUrl = await getBaseUrl();

            const response = await axios.get(`${baseUrl}/api/prepare-po/vendors`, {
                params: { networkId },
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(getErrorMessage(err, "Failed to fetch vendors"));
        }
    }
);

export const fetchPoProfiles = createAsyncThunk(
    "purchaseOrder/fetchPoProfiles",
    async ({ networkId, productType }, { rejectWithValue }) => {
        try {
            const baseUrl = await getBaseUrl();

            const response = await axios.get(`${baseUrl}/api/prepare-po/profiles`, {
                params: {
                    networkId,
                    productType,
                },
            });

            return response.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to fetch profiles"
            );
        }
    }
);

export const generatePurchaseOrder = createAsyncThunk(
    "purchaseOrder/generatePurchaseOrder",
    async (payload, { rejectWithValue }) => {
        try {
            const baseUrl = await getBaseUrl();

            const response = await axios.post(
                `${baseUrl}/api/prepare-po/insert`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            return response.data;
        } catch (err) {
            return rejectWithValue(
                getErrorMessage(err, "Failed to create purchase order")
            );
        }
    }
);

export const approvePurchaseOrder = createAsyncThunk(
    "purchaseOrder/approvePurchaseOrder",
    async ({ poNo, remarks }, { rejectWithValue }) => {
        try {
            const baseUrl = await getBaseUrl();

            const response = await axios.post(
                `${baseUrl}/api/approval-po/${poNo}/approve`,
                { remarks }
            );

            return response.data;
        } catch (err) {
            return rejectWithValue(
                getErrorMessage(err, "Failed to approve purchase order")
            );
        }
    }
);

export const rejectPurchaseOrder = createAsyncThunk(
    "purchaseOrder/rejectPurchaseOrder",
    async ({ poNo, remarks }, { rejectWithValue }) => {
        try {
            const baseUrl = await getBaseUrl();

            const response = await axios.post(
                `${baseUrl}/api/approval-po/${poNo}/reject`,
                { remarks }
            );

            return response.data;
        } catch (err) {
            return rejectWithValue(
                getErrorMessage(err, "Failed to reject purchase order")
            );
        }
    }
);

export const generatePOFile = createAsyncThunk(
    "purchaseOrder/generatePOFile",
    async ({ poNo }, { rejectWithValue }) => {
        try {
            const baseUrl = await getBaseUrl();

            const response = await axios.post(
                `${baseUrl}/api/approval-po/${poNo}/generate`,
                null,
                {
                    responseType: "blob",
                }
            );

            return response.data;
        } catch (err) {
            return rejectWithValue(getErrorMessage(err, "File generation failed"));
        }
    }
);

export const cancelPurchaseOrder = createAsyncThunk(
    "purchaseOrder/cancelPurchaseOrder",
    async ({ poNo, remarks }, { rejectWithValue }) => {
        try {
            const baseUrl = await getBaseUrl();

            const response = await axios.post(
                `${baseUrl}/api/approval-po/${poNo}/cancel`,
                { remarks }
            );

            return response.data;
        } catch (err) {
            return rejectWithValue(
                getErrorMessage(err, "Failed to cancel purchase order")
            );
        }
    }
);

//fetch po history

export const fetchPoHistory = createAsyncThunk(
    "purchaseOrder/fetchPoHistory",
    async (payload, { rejectWithValue }) => {
        try {
            const baseUrl = await getBaseUrl();

            const response = await axios.post(
                `${baseUrl}/api/po/history/search`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            return response.data;
        } catch (err) {
            return rejectWithValue(
                getErrorMessage(err, "Failed to fetch PO history")
            );
        }
    }
);

export const fetchPoDetails = createAsyncThunk(
    "purchaseOrder/fetchPoDetails",
    async (poNo, { rejectWithValue }) => {
        try {
            const baseUrl = await getBaseUrl();

            const response = await axios.get(`${baseUrl}/api/po/${poNo}`);

            return response.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message ||
                err.response?.data ||
                err.message ||
                "Failed to fetch PO details"
            );
        }
    }
);

const initialState = {
    list: [],
    vendors: [],
    profiles: [],
    poHistoryList: [],

    loading: false,
    vendorLoading: false,
    profileLoading: false,
    poHistoryLoading: false,
    submitting: false,
    approving: false,
    rejecting: false,

    error: null,
    vendorError: null,
    profileError: null,
    poHistoryError: null,
    submitError: null,
    actionError: null,

    submitSuccess: false,
    approveSuccess: false,
    rejectSuccess: false,
    poDetails: null,
    poDetailsLoading: false,
    poDetailsError: null,
};

const purchaseOrderSlice = createSlice({
    name: "purchaseOrder",

    initialState,

    reducers: {
        clearPurchaseOrderState(state) {
            state.error = null;
            state.vendorError = null;
            state.profileError = null;
            state.poHistoryError = null;
            state.submitError = null;
            state.actionError = null;

            state.submitSuccess = false;
            state.approveSuccess = false;
            state.rejectSuccess = false;
            state.poDetailsError = null;
        },
    },

    extraReducers: (builder) => {
        builder

            .addCase(fetchPoDetails.pending, (state) => {
                state.poDetailsLoading = true;
                state.poDetailsError = null;
                state.poDetails = null;
            })
            .addCase(fetchPoDetails.fulfilled, (state, action) => {
                state.poDetailsLoading = false;
                state.poDetails = action.payload || null;
            })
            .addCase(fetchPoDetails.rejected, (state, action) => {
                state.poDetailsLoading = false;
                state.poDetailsError = action.payload;
                state.poDetails = null;
            })

            .addCase(fetchPurchaseOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.list = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchPurchaseOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.list = [];
            })

            .addCase(fetchPoVendors.pending, (state) => {
                state.vendorLoading = true;
                state.vendorError = null;
            })
            .addCase(fetchPoVendors.fulfilled, (state, action) => {
                state.vendorLoading = false;
                state.vendors = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchPoVendors.rejected, (state, action) => {
                state.vendorLoading = false;
                state.vendorError = action.payload;
                state.vendors = [];
            })

            .addCase(fetchPoProfiles.pending, (state) => {
                state.profileLoading = true;
                state.profileError = null;
            })
            .addCase(fetchPoProfiles.fulfilled, (state, action) => {
                state.profileLoading = false;
                state.profiles = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchPoProfiles.rejected, (state, action) => {
                state.profileLoading = false;
                state.profileError = action.payload;
                state.profiles = [];
            })

            .addCase(fetchPoHistory.pending, (state) => {
                state.poHistoryLoading = true;
                state.poHistoryError = null;
                state.poHistoryList = [];
            })
            .addCase(fetchPoHistory.fulfilled, (state, action) => {
                state.poHistoryLoading = false;
                state.poHistoryList = Array.isArray(action.payload)
                    ? action.payload
                    : [];
            })
            .addCase(fetchPoHistory.rejected, (state, action) => {
                state.poHistoryLoading = false;
                state.poHistoryError = action.payload;
                state.poHistoryList = [];
            })

            .addCase(generatePurchaseOrder.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
                state.submitSuccess = false;
            })
            .addCase(generatePurchaseOrder.fulfilled, (state) => {
                state.submitting = false;
                state.submitSuccess = true;
            })
            .addCase(generatePurchaseOrder.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            })

            .addCase(approvePurchaseOrder.pending, (state) => {
                state.approving = true;
                state.actionError = null;
                state.approveSuccess = false;
            })
            .addCase(approvePurchaseOrder.fulfilled, (state) => {
                state.approving = false;
                state.approveSuccess = true;
            })
            .addCase(approvePurchaseOrder.rejected, (state, action) => {
                state.approving = false;
                state.actionError = action.payload;
            })

            .addCase(rejectPurchaseOrder.pending, (state) => {
                state.rejecting = true;
                state.actionError = null;
                state.rejectSuccess = false;
            })
            .addCase(rejectPurchaseOrder.fulfilled, (state) => {
                state.rejecting = false;
                state.rejectSuccess = true;
            })
            .addCase(rejectPurchaseOrder.rejected, (state, action) => {
                state.rejecting = false;
                state.actionError = action.payload;
            })

            .addCase(generatePOFile.pending, (state) => {
                state.loading = true;
                state.actionError = null;
            })
            .addCase(generatePOFile.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(generatePOFile.rejected, (state, action) => {
                state.loading = false;
                state.actionError = action.payload;
            })

            .addCase(cancelPurchaseOrder.pending, (state) => {
                state.loading = true;
                state.actionError = null;
            })
            .addCase(cancelPurchaseOrder.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(cancelPurchaseOrder.rejected, (state, action) => {
                state.loading = false;
                state.actionError = action.payload;
            });
    },
});

export const { clearPurchaseOrderState } = purchaseOrderSlice.actions;

export default purchaseOrderSlice.reducer;
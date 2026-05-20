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

export const uploadMsisdnFile = createAsyncThunk(
    "msisdnUpload/uploadMsisdnFile",
    async ({ networkId, file }, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();

            const formData = new FormData();
            formData.append("networkId", networkId);
            formData.append("file", file);

            const response = await axios.post(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/msisdn/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error("uploadMsisdnFile error:", error);

            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data ||
                error.message ||
                "MSISDN upload failed"
            );
        }
    }
);

const msisdnUploadSlice = createSlice({
    name: "msisdnUpload",
    initialState: {
        loading: false,
        success: false,
        error: null,
        response: null,
    },
    reducers: {
        clearMsisdnUploadState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
            state.response = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(uploadMsisdnFile.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
                state.response = null;
            })
            .addCase(uploadMsisdnFile.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.response = action.payload;
                state.error = null;
            })
            .addCase(uploadMsisdnFile.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload;
            });
    },
});

export const { clearMsisdnUploadState } = msisdnUploadSlice.actions;

export const selectMsisdnUploadLoading = (state) => state.msisdnUpload.loading;
export const selectMsisdnUploadSuccess = (state) => state.msisdnUpload.success;
export const selectMsisdnUploadError = (state) => state.msisdnUpload.error;
export const selectMsisdnUploadResponse = (state) => state.msisdnUpload.response;

export default msisdnUploadSlice.reducer;
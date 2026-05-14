import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

import { loadConfig } from "../../../services/configService";

// Cache config after first load
let cachedConfigPromise = null;

async function getApiConfig() {

    if (!cachedConfigPromise) {
        cachedConfigPromise = loadConfig();
    }

    return cachedConfigPromise;
}

// LOGIN API
export const loginUser = createAsyncThunk(
    "auth/loginUser",

    async (
        {
            networkName,
            username,
            password,
        },
        { rejectWithValue }
    ) => {

        try {
            const apiConfig = await getApiConfig();

            const response = await axios.post(
                `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/admin`,
                {
                    networkName: networkName ?? null,
                    userName: username,
                    password,
                }
            );

            console.log(response.data);

            return response.data;

        } catch (err) {

            return rejectWithValue(
                err.response?.data || {
                    errorCode: 500,
                    message: "Server error",
                }
            );
        }
    }
);

const authSlice = createSlice({
    name: "auth",

    initialState: {
        loading: false,
        isAuthenticated: false,
        user: null,
        error: null,
        networkName: "",
        username: "",
        password: "",
        modules: [],
    },

    reducers: {

        setNetworkName: (state, action) => {
            state.networkName = action.payload;
        },

        setUsername: (state, action) => {
            state.username = action.payload;
        },

        setPassword: (state, action) => {
            state.password = action.payload;
        },

        clearForm: (state) => {
            state.networkName = "";
            state.username = "";
            state.password = "";
            state.error = null;
            state.isAuthenticated = false;
            state.user = null;
            state.loading = false;
            state.modules = [];
        },

        clearError: (state) => {
            state.error = null;
        },

        logout: (state) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
            state.networkName = "";
            state.username = "";
            state.password = "";
            state.modules = [];
        },
    },

    extraReducers: (builder) => {

        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.isAuthenticated = false;
                state.user = null;
                state.modules = [];
            })

            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.error = null;
                state.modules =
                    action.payload?.modules || [];
            })

            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload;
            });
    },
});

export const {
    setNetworkName,
    setUsername,
    setPassword,
    clearForm,
    clearError,
    logout,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
export default authSlice.reducer;
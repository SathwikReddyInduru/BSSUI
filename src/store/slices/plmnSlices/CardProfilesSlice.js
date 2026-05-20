// src/features/CardProfiles/CardProfilesSlice.js

import {
    createSlice,
    createAsyncThunk,
} from "@reduxjs/toolkit";

import axiosService from "@/services/AxiosService";

import { loadConfig } from "@/services/configService";

// Cache config
let cachedConfigPromise = null;

async function getApiConfig() {

    if (!cachedConfigPromise) {
        cachedConfigPromise = loadConfig();
    }

    return cachedConfigPromise;
}

/* FETCH CARD PROFILES */

export const fetchCardProfilesThunk =
    createAsyncThunk(

        "cardProfiles/fetchCardProfiles",

        async (networkId, { rejectWithValue }) => {

            try {

                const apiConfig =
                    await getApiConfig();

                const endpoint =
                    `${apiConfig.api.endpoints.cardProfiles_API}?networkId=${networkId}`;

                const response =
                    await axiosService.get(endpoint);

                const formattedData =
                    response.data.map((item) => ({

                        id: item.profileId,

                        profileName: item.profileName,

                        category: item.categoryName,

                        statusCode: item.status,

                        profileDefaultFlagYn: item.profileDefaultFlagYn,

                        status: item.status === "AC" ? "Approved"
                                : item.status === "UA"
                                    ? "Created"
                                    : item.status === "RJ"
                                        ? "Rejected"
                                        : item.status,
                    }));

                return formattedData;

            } catch (error) {

                return rejectWithValue(

                    error.response?.data || {

                        errorCode: 500,

                        message:
                            "Failed to fetch card profiles",
                    }
                );
            }
        }
    );

const cardProfilesSlice = createSlice({

    name: "cardProfiles",

    initialState: {

        loading: false,

        cardProfiles: [],

        error: null,
    },

    reducers: {

        clearCardProfiles: (state) => {

            state.cardProfiles = [];

            state.error = null;

            state.loading = false;
        },
    },

    extraReducers: (builder) => {

        builder

            .addCase(
                fetchCardProfilesThunk.pending,
                (state) => {

                    state.loading = true;

                    state.error = null;
                }
            )

            .addCase(
                fetchCardProfilesThunk.fulfilled,
                (state, action) => {

                    state.loading = false;

                    state.cardProfiles =
                        action.payload;
                }
            )

            .addCase(
                fetchCardProfilesThunk.rejected,
                (state, action) => {

                    state.loading = false;

                    state.error = action.payload;

                    state.cardProfiles = [];
                }
            );
    },
});

export const {
    clearCardProfiles,
} = cardProfilesSlice.actions;

export const cardProfilesReducer =
    cardProfilesSlice.reducer;

export default cardProfilesSlice.reducer;
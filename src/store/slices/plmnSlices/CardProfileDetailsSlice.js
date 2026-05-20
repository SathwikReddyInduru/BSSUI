import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosService from "@/services/AxiosService";
import { loadConfig } from "@/services/configService";

let cachedConfigPromise = null;

async function getApiConfig() {
    if (!cachedConfigPromise) {
        cachedConfigPromise = loadConfig();
    }
    return cachedConfigPromise;
}

export const fetchCardProfileDetailsThunk = createAsyncThunk(
    "cardProfileDetails/fetchCardProfileDetails",
    async ({ networkId, profileId }, { rejectWithValue }) => {
        try {
            const apiConfig = await getApiConfig();

            const endpoint = `${apiConfig.api.endpoints.cardProfileDetails_API}/${profileId}/${networkId}`;

            const response = await axiosService.get(endpoint);
            const data = response.data; // ✅ extract .data from Axios response

            const formattedData = {
                profile_id: data.profile_id,
                card_name: data.card_name,
                type_id: data.type_id,
                latesttariffplan_id: data.latesttariffplan_id,
                validity_period: data.validity_period,
                grace_period1: data.grace_period1,
                grace_period2: data.grace_period2,
                shelf_life: data.shelf_life,
                quarantine_period: data.quarantine_period,
                status:
                    data.status === "AC" ? "Approved"
                        : data.status === "UA" ? "Created"
                            : data.status === "RJ" ? "Rejected"
                                : data.status,
                network_id: data.network_id,
            };

            return formattedData;

        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    errorCode: 500,
                    message: "Failed to fetch card profile details",
                }
            );
        }
    }
);

const cardProfileDetailsSlice = createSlice({
    name: "cardProfileDetails",
    initialState: {
        loading: false,
        cardProfileDtls: null, // ✅ null is safer than {} for "not loaded yet" checks
        success: "idle",
        error: null,
    },
    reducers: {
        clearCardProfileDetails: (state) => { // ✅ renamed to match what the component imports
            state.cardProfileDtls = null;
            state.error = null;
            state.success = "idle";
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCardProfileDetailsThunk.pending, (state) => {
                state.loading = true;
                state.success = "idle";
                state.error = null;
            })
            .addCase(fetchCardProfileDetailsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.success = "true";
                state.cardProfileDtls = action.payload;
            })
            .addCase(fetchCardProfileDetailsThunk.rejected, (state, action) => {
                state.loading = false;
                state.success = "false";
                state.error = action.payload;
                state.cardProfileDtls = null; // ✅ was state.cardProfiles = [] (wrong field)
            });
    },
});

export const { clearCardProfileDetails } = cardProfileDetailsSlice.actions; // ✅ correct export name

export const cardProfileDetailsReducer = cardProfileDetailsSlice.reducer; // ✅ renamed to match slice

export default cardProfileDetailsSlice.reducer;
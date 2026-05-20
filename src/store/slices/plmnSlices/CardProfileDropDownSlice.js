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

/* =========================================
   FETCH DROPDOWN DATA
========================================= */

export const fetchCardProfileDropDownThunk = createAsyncThunk(
  "cardProfileDropDown/fetch",
  async ({ networkId }, { rejectWithValue }) => {
    try {
      const apiConfig = await getApiConfig();

      const endpoint = `${apiConfig.api.endpoints.Card_Profile_DropDown_API}?networkId=${networkId}`;

      const response = await axiosService.get(endpoint);

      const data = response.data;

      return {
        tariffPackages: data.tariffPackages || [],

        creditProfiles: data.creditProfiles || [],

        categories: data.categories || [],
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          errorCode: "500",
          message: "Failed to fetch dropdown details",
        },
      );
    }
  },
);

const initialState = {
  loading: false,

  success: "idle",

  error: null,

  dropdowns: {
    tariffPackages: [],

    creditProfiles: [],

    categories: [],
  },
};

const cardProfileDropDownSlice = createSlice({
  name: "cardProfileDropDown",

  initialState,

  reducers: {
    clearCardProfileDropDown: (state) => {
      state.loading = false;

      state.success = "idle";

      state.error = null;

      state.dropdowns = {
        tariffPackages: [],

        creditProfiles: [],

        categories: [],
      };
    },
  },

  extraReducers: (builder) => {
    builder

      /* PENDING */

      .addCase(fetchCardProfileDropDownThunk.pending, (state) => {
        state.loading = true;

        state.success = "idle";

        state.error = null;
      })

      /* SUCCESS */

      .addCase(fetchCardProfileDropDownThunk.fulfilled, (state, action) => {
        state.loading = false;

        state.success = "true";

        state.dropdowns = action.payload;
      })

      /* FAILED */

      .addCase(fetchCardProfileDropDownThunk.rejected, (state, action) => {
        state.loading = false;

        state.success = "false";

        state.error = action.payload;

        state.dropdowns = {
          tariffPackages: [],

          creditProfiles: [],

          categories: [],
        };
      });
  },
});

export const { clearCardProfileDropDown } = cardProfileDropDownSlice.actions;

export const cardProfileDropDownReducer = cardProfileDropDownSlice.reducer;

export default cardProfileDropDownSlice.reducer;

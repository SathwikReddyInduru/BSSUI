// src/ReduxStore/slices/roleDetailsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosService from '../../../services/AxiosService';
import { loadConfig } from '../../../services/configService';
let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig(); // assuming loadConfig() returns a Promise
  }
  return cachedConfigPromise;
}

export const fetchRoleDetails = createAsyncThunk(
  'roleDetails/fetchRoleDetails',
  async ({ roleId, networkId }, { rejectWithValue }) => {
    try {
      const apiConfig = await getApiConfig();
      const response = await axiosService.post(`http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/viewRole`,

        {
          roleId: roleId,           // ← Keep it as string!
          networkId: Number(networkId),
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      return response.data;
    } catch (err) {
      console.error('fetchRoleDetails error:', err);
      return rejectWithValue(
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch role details'
      );
    }
  }
);

const roleDetailsSlice = createSlice({
  name: 'roleDetails',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearRoleDetails: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoleDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoleDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchRoleDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearRoleDetails,
} = roleDetailsSlice.actions;

export const selectRoleDetailsData = (state) => state.roleDetails.data;
export const selectRoleDetailsLoading = (state) => state.roleDetails.loading;
export const selectRoleDetailsError = (state) => state.roleDetails.error;

export default roleDetailsSlice.reducer;

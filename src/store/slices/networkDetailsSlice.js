// src/store/slices/networkDetailsSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosService from '../../services/AxiosService';
import { loadConfig } from './configService';

let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig();
  }
  return cachedConfigPromise;
}

// Async thunk to fetch network details
export const fetchNetworkDetails = createAsyncThunk(
  'networkDetails/fetchNetworkDetails',
  async (networkId, { rejectWithValue }) => {
    try {
      const apiConfig = await getApiConfig();
      
      // ── This is the only real change ───────────────────────────────
      const url = `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/network/view`;
      // ────────────────────────────────────────────────────────────────

      const response = await axiosService.post(
        url,
        { networkId: Number(networkId) },
        {
          headers: {
            'Content-Type': 'application/json',
            // Add authorization header if your API requires it
            // 'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.status !== 'SUCCESS') {
        return rejectWithValue(response.data.message || 'Failed to fetch network details');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Network error while fetching network details'
      );
    }
  }
);

const initialState = {
  networkDetails: null,
  loading: false,
  error: null,
};

const networkDetailsSlice = createSlice({
  name: 'networkDetails',
  initialState,
  reducers: {
    clearNetworkDetails: (state) => {
      state.networkDetails = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNetworkDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNetworkDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.networkDetails = action.payload;
      })
      .addCase(fetchNetworkDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNetworkDetails } = networkDetailsSlice.actions;

export const selectNetworkDetails = (state) => state.networkDetails.networkDetails;
export const selectNetworkDetailsLoading = (state) => state.networkDetails.loading;
export const selectNetworkDetailsError = (state) => state.networkDetails.error;

export default networkDetailsSlice.reducer;

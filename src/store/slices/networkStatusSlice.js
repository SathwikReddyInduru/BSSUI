// src/store/slices/networkStatusSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosService from '../../services/AxiosService';
import { loadConfig } from './configService';
// import { showError, showSuccess } from '.../utils/toast'; // adjust path if needed

let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig();
  }
  return cachedConfigPromise;
}

// Async thunk to update network status
export const updateNetworkStatus = createAsyncThunk(
  'networkStatus/updateNetworkStatus',
  async ({ networkId, networkName, statusCode }, { rejectWithValue }) => {
    try {
      const apiConfig = await getApiConfig();
      
      // URL now dynamically read from config (only change)
      const url = `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/network/updateNetworks`;

      const payload = {
        network_id: Number(networkId),
        network_name: networkName,
        status_code: statusCode, // "AC" or "DA"
      };

      const response = await axiosService.put(
        url,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            // Add auth header if required later
            // 'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.responseCode !== '200') {
        return rejectWithValue(response.data.message || 'Failed to update network status');
      }

      return {
        message: response.data.message,
        network: response.data.network,
        statusCode: response.data.statusCode,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Network error while updating status'
      );
    }
  }
);

const initialState = {
  loading: false,
  successMessage: null,
  error: null,
};

const networkStatusSlice = createSlice({
  name: 'networkStatus',
  initialState,
  reducers: {
    clearNetworkStatus: (state) => {
      state.loading = false;
      state.successMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateNetworkStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateNetworkStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(updateNetworkStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNetworkStatus } = networkStatusSlice.actions;

export const selectNetworkStatusLoading = (state) => state.networkStatus.loading;
export const selectNetworkStatusSuccess = (state) => state.networkStatus.successMessage;
export const selectNetworkStatusError = (state) => state.networkStatus.error;

export default networkStatusSlice.reducer;

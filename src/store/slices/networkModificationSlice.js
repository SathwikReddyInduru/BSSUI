// src/store/slices/networkModificationSlice.js

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

// Async thunk to modify network
export const modifyNetwork = createAsyncThunk(
  'networkModification/modifyNetwork',
  async (payload, { rejectWithValue }) => {
    try {
      const apiConfig = await getApiConfig();
      
      // URL now read from config (only change)
      const url = `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/network/modify`;

      const response = await axiosService.put(
        url,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            // Add authorization if needed
            // 'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.status !== 'SUCCESS') {
        return rejectWithValue(response.data.message || 'Network modification failed');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Network error during modification'
      );
    }
  }
);

const initialState = {
  loading: false,
  success: false,
  error: null,
};

const networkModificationSlice = createSlice({
  name: 'networkModification',
  initialState,
  reducers: {
    resetNetworkModification: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(modifyNetwork.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(modifyNetwork.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(modifyNetwork.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { resetNetworkModification } = networkModificationSlice.actions;

export const selectNetworkModificationLoading = (state) => state.networkModification.loading;
export const selectNetworkModificationSuccess = (state) => state.networkModification.success;
export const selectNetworkModificationError = (state) => state.networkModification.error;

export default networkModificationSlice.reducer;

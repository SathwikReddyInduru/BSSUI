// src/store/slices/networkCreationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadConfig } from './configService'; // assuming you have this

let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig();
  }
  return cachedConfigPromise;
}

export const createNetwork = createAsyncThunk(
  'networkCreation/createNetwork',
  async (networkData, { rejectWithValue }) => {
    try {
const apiConfig = await getApiConfig();

      // For local dev – you can hard-code or override config if needed
      //const baseUrl = 'http://10.10.19.157:8092'; // ← your target endpoint
        const baseUrl = `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}`;
      const fullUrl = `${baseUrl}/network/create`;

     
      console.log('[createNetwork] Sending to:', fullUrl);
      console.log('[createNetwork] Payload:', networkData);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,   // ← add if needed later
        },
        body: JSON.stringify(networkData),
      });

      let data;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = response.ok
          ? { status: 'SUCCESS', message: text || 'Network created' }
          : { status: 'ERROR', message: text || 'Server error' };
      }

      if (!response.ok || data?.status?.toUpperCase() !== 'SUCCESS') {
        const errorMsg =
          data?.message ||
          data?.error ||
          data?.errorDesc ||
          `Server responded with status ${response.status}`;
        return rejectWithValue(errorMsg);
      }

      console.log('[createNetwork] Success:', data);
      return data;

    } catch (err) {
      console.error('[createNetwork] Failed:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        return rejectWithValue('Cannot reach server. Check network / firewall / URL.');
      }
      return rejectWithValue(err.message || 'Network creation failed');
    }
  }
);

const networkCreationSlice = createSlice({
  name: 'networkCreation',
  initialState: {
    loading: false,
    success: false,
    error: null,
    createdNetwork: null, // can store response if needed
  },
  reducers: {
    resetNetworkCreation: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.createdNetwork = null;
    },
    clearNetworkCreationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNetwork.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createNetwork.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.createdNetwork = action.payload;
        state.error = null;
      })
      .addCase(createNetwork.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Unknown error';
      });
  },
});

export const { resetNetworkCreation, clearNetworkCreationError } = networkCreationSlice.actions;
export default networkCreationSlice.reducer;

// Selectors
export const selectNetworkCreationLoading = (state) => state.networkCreation?.loading ?? false;
export const selectNetworkCreationSuccess = (state) => state.networkCreation?.success ?? false;
export const selectNetworkCreationError   = (state) => state.networkCreation?.error   ?? null;
export const selectCreatedNetwork         = (state) => state.networkCreation?.createdNetwork ?? null;
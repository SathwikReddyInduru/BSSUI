// src/ReduxStore/slices/privilegesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadConfig } from '../../../services/configService';

// Cache the config promise (loaded only once)
let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig();
  }
  return cachedConfigPromise;
}

export const fetchPrivileges = createAsyncThunk(
  'privileges/fetchPrivileges',
  async (networkId, { rejectWithValue }) => {
    try {
      const apiConfig = await getApiConfig();

      // Build the full URL from config (this is usually what people want)
      const baseUrl = `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}`;
      const url = `${baseUrl}/api/privileges/${networkId}`;

      console.log('[fetchPrivileges] Using URL:', url); // ← helpful for debugging

      const response = await fetch(url, {
        method: 'GET',           // assuming this endpoint is GET
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization if needed: 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} - ${errorText || 'Failed to fetch privileges'}`);
      }

      const data = await response.json();

      // Adjust based on your actual response shape
      // If it's { modules: [...] }, return data.modules
      // If it's directly an array, return data
      return data.modules ?? data;
    } catch (err) {
      console.error('[fetchPrivileges] Error:', err);
      return rejectWithValue(err.message || 'Failed to fetch privileges');
    }
  }
);

const privilegesSlice = createSlice({
  name: 'privileges',
  initialState: {
    loading: false,
    data: [],
    error: null,
  },
  reducers: {}, // add reset if needed
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrivileges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrivileges.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload || [];
        state.error = null;
      })
      .addCase(fetchPrivileges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load privileges';
        state.data = [];
      });
  },
});

export default privilegesSlice.reducer;

export const selectPrivilegesLoading = (state) => state.privileges.loading;
export const selectPrivilegesData = (state) => state.privileges.data;
export const selectPrivilegesError = (state) => state.privileges.error;
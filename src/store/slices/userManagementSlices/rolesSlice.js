// src/ReduxStore/slices/rolesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadConfig } from '../../../services/configService'; // uncomment & adjust path if needed

// Optional: cache the config promise so it's fetched only once (across all thunks/calls)
let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig(); // assuming loadConfig() returns a Promise
  }
  return cachedConfigPromise;
}

export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles',
  async (networkId, { rejectWithValue }) => {
    try {
      const apiConfig = await getApiConfig();
      const baseUrl = `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}`;
      const url = `${baseUrl}/api/getRoles/${networkId}`;

      console.log('[fetchRoles] Fetching roles from URL:', url);
      console.log('[fetchRoles] Network ID:', networkId);

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`HTTP ${response.status} - Failed to fetch roles`);
        throw new Error(`HTTP ${response.status} - ${errorText || 'Failed to fetch roles'}`);
      }

      const data = await response.json();
      console.log('[fetchRoles] Raw API response:', data);

      return data; // expected: array of role objects
    } catch (err) {
      console.error('[fetchRoles] Error:', err);
      return rejectWithValue(err.message || 'Failed to fetch roles');
    }
  }
);

// Rest of the slice remains unchanged
const rolesSlice = createSlice({
  name: 'roles',
  initialState: {
    loading: false,
    success: false,
    error: null,
    data: [],
  },
  reducers: {
    resetRolesState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.data = [];
    },
    clearRolesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;

        if (Array.isArray(payload) && payload.length > 0) {
          state.success = true;
          state.data = payload;
          state.error = null;
        } else {
          state.success = false;
          state.data = [];
          state.error = 'No roles found or invalid response format';
        }
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Failed to fetch roles';
      });
  },
});

export const { resetRolesState, clearRolesError } = rolesSlice.actions;
export default rolesSlice.reducer;

// Selectors (unchanged)
export const selectRolesLoading = (state) => state.roles.loading;
export const selectRolesSuccess = (state) => state.roles.success;
export const selectRolesError = (state) => state.roles.error;
export const selectRolesData = (state) => state.roles.data;
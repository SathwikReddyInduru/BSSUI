// src/ReduxStore/slices/rolePrivilegesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadConfig } from '../../../services/configService';

let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig();
  }
  return cachedConfigPromise;
}

export const fetchRolePrivileges = createAsyncThunk(
  'rolePrivileges/fetchRolePrivileges',
  async ({ networkId, roleId }, { rejectWithValue }) => {
    if (!networkId || !roleId) {
      return rejectWithValue('networkId and roleId are required');
    }

    try {
      const config = await getApiConfig();

      const fullUrl = `http://${config.api.server}:${config.api.port.port_1}/api/privileges`;

      console.log('[fetchRolePrivileges] URL:', fullUrl);
      console.log('[fetchRolePrivileges] Payload:', { networkId, roleId });

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${yourTokenHere}`   ← add if required
        },
        body: JSON.stringify({ networkId, roleId }),
      });

      if (!response.ok) {
        let errorBody = '';
        try {
          errorBody = await response.text();
        } catch { }
        throw new Error(
          `HTTP ${response.status} – ${errorBody || 'Failed to fetch role privileges'}`
        );
      }

      const data = await response.json();
      console.log('[fetchRolePrivileges] Raw API response:', data);

      return data; // expected shape: { roleId, roleName, roleDescription, mappedPrivileges, unmappedPrivileges }
    } catch (err) {
      console.error('[fetchRolePrivileges] Error:', err);
      if (err.message.includes('fetch')) {
        return rejectWithValue(
          'Network / fetch error – check URL, CORS, server availability'
        );
      }
      return rejectWithValue(err.message || 'Failed to fetch role privileges');
    }
  }
);

const rolePrivilegesSlice = createSlice({
  name: 'rolePrivileges',
  initialState: {
    loading: false,
    success: false,
    error: null,
    data: null,
  },
  reducers: {
    resetRolePrivilegesState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.data = null;
    },
    clearRolePrivilegesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolePrivileges.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(fetchRolePrivileges.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;

        if (payload && payload.roleId && Array.isArray(payload.mappedPrivileges)) {
          state.success = true;
          state.data = payload;
          state.error = null;
        } else {
          state.success = false;
          state.data = null;
          state.error = 'Invalid response format from server';
        }
      })
      .addCase(fetchRolePrivileges.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Failed to fetch role privileges';
      });
  },
});

export const { resetRolePrivilegesState, clearRolePrivilegesError } = rolePrivilegesSlice.actions;
export default rolePrivilegesSlice.reducer;

// Selectors (unchanged)
export const selectRolePrivilegesLoading = (state) => state.rolePrivileges.loading;
export const selectRolePrivilegesSuccess = (state) => state.rolePrivileges.success;
export const selectRolePrivilegesError = (state) => state.rolePrivileges.error;
export const selectRolePrivilegesData = (state) => state.rolePrivileges.data;
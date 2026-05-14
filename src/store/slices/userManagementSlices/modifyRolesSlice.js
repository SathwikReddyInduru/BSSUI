import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadConfig } from '../../../services/configService'; // adjust path if needed
import axios from 'axios'; // make sure axios is imported if you use it

let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig(); // assuming loadConfig() returns a Promise
  }
  return cachedConfigPromise;
}

export const modifyUserRoles = createAsyncThunk(
  'modifyRoles/modifyUserRoles',
  async ({ loginId, networkId, updRoles }, { rejectWithValue }) => {
    try {
      // Load config once per thunk call (or cache it if needed)
      const apiConfig = await getApiConfig();

      // If you really need to POST to get a base URL (uncommon pattern), do it here
      // Most likely you just want a static base URL constructed from config
      const BASE_URL = `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api`;

      // Alternative: if that axios.post is supposed to return the actual base URL or token:
      // const response = await axios.post(`http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api`);
      // const BASE_URL = response.data?.url || '...';

      const response = await fetch(`${BASE_URL}/modifyRoles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          networkId,
          loginId,
          updRoles, // array of role IDs like ["R16", "R26"]
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return rejectWithValue(errText || `HTTP error ${response.status}`);
      }

      const data = await response.json();

      if (data.message) {
        return data;
      }

      return rejectWithValue('Unexpected response format');
    } catch (err) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

// Rest of your slice stays exactly the same
const modifyRolesSlice = createSlice({
  name: 'modifyRoles',
  initialState: {
    loading: false,
    success: false,
    message: null,
    error: null,
  },
  reducers: {
    resetModifyRoles: (state) => {
      state.loading = false;
      state.success = false;
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(modifyUserRoles.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.message = null;
        state.error = null;
      })
      .addCase(modifyUserRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Roles modified successfully';
        state.error = null;
      })
      .addCase(modifyUserRoles.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.message = null;
        state.error = action.payload || 'Failed to modify roles';
      });
  },
});

export const { resetModifyRoles } = modifyRolesSlice.actions;
export default modifyRolesSlice.reducer;

// Selectors
export const selectModifyRolesLoading = (state) => state.modifyRoles?.loading ?? false;
export const selectModifyRolesSuccess = (state) => state.modifyRoles?.success ?? false;
export const selectModifyRolesMessage = (state) => state.modifyRoles?.message ?? null;
export const selectModifyRolesError = (state) => state.modifyRoles?.error ?? null;
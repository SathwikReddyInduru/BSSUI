// src/ReduxStore/slices/userRolesSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadConfig } from '../../../services/configService';
//const BASE_URL = 'http://10.10.19.172:8092/api';

// Optional: cache the config promise globally so it's only loaded once across all thunks/calls
let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig();
  }
  return cachedConfigPromise;
}

// Fetch assigned + all roles for a user
export const fetchUserRoles = createAsyncThunk(
  'userRoles/fetchUserRoles',
  async ({ loginId, networkId }, { rejectWithValue }) => {
    try {
      const apiConfig = await getApiConfig();
      const BASE_URL = `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api`;
      const response = await fetch(`${BASE_URL}/getAssignRoles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, networkId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch user roles');
    }
  }
);

// Update roles for a user (you'll need to adjust endpoint/payload as per your backend)
export const updateUserRoles = createAsyncThunk(
  'userRoles/updateUserRoles',
  async ({ loginId, networkId, roleIds }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/updateUserRoles`, {  // ← change endpoint if different
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, networkId, roleIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update user roles');
    }
  }
);

const userRolesSlice = createSlice({
  name: 'userRoles',
  initialState: {
    loading: false,
    data: null, // { assignedRoles: [], allRoles: [] }
    error: null,
    updateLoading: false,
    updateSuccess: false,
    updateError: null,
  },
  reducers: {
    resetUserRoles: (state) => {
      state.loading = false;
      state.data = null;
      state.error = null;
    },
    resetUserRolesUpdate: (state) => {
      state.updateLoading = false;
      state.updateSuccess = false;
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchUserRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateUserRoles.pending, (state) => {
        state.updateLoading = true;
        state.updateSuccess = false;
        state.updateError = null;
      })
      .addCase(updateUserRoles.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
      })
      .addCase(updateUserRoles.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

export const { resetUserRoles, resetUserRolesUpdate } = userRolesSlice.actions;
export default userRolesSlice.reducer;

// Selectors
export const selectUserRolesLoading = (state) => state.userRoles.loading;
export const selectUserRolesData = (state) => state.userRoles.data;
export const selectUserRolesError = (state) => state.userRoles.error;

export const selectUserRolesUpdateLoading = (state) => state.userRoles.updateLoading;
export const selectUserRolesUpdateSuccess = (state) => state.userRoles.updateSuccess;
export const selectUserRolesUpdateError = (state) => state.userRoles.updateError;
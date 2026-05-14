// src/ReduxStore/slices/createRoleSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadConfig } from '../../../services/configService';
let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig(); // assuming loadConfig() returns a Promise
  }
  return cachedConfigPromise;
}

export const createRole = createAsyncThunk(
  'createRole/createRole',
  async (payload, { rejectWithValue }) => {
    const apiConfig = await getApiConfig();
    const url = `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/submitRole`;
    // const url = 'http://10.10.19.172:8092/api/submitRole';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json(); // Always parse the body

      if (!response.ok) {
        // Reject with the full error data from API
        return rejectWithValue(data);
      }

      return data; // Success: return success data
    } catch (err) {
      // Handle network or other errors
      return rejectWithValue({
        message: err.message || 'An unexpected error occurred. Please check your connection.',
      });
    }
  }
);

const createRoleSlice = createSlice({
  name: 'createRole',
  initialState: {
    loading: false,
    success: false,
    error: null,
    message: null,
  },
  reducers: {
    resetCreateRole: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.message = action.payload?.message || 'Role created successfully';
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.message = null;
        state.error = action.payload; // Store the full error object or string
      });
  },
});

export const { resetCreateRole } = createRoleSlice.actions;
export default createRoleSlice.reducer;

export const selectCreateRoleLoading = (state) => state.createRole.loading;
export const selectCreateRoleSuccess = (state) => state.createRole.success;
export const selectCreateRoleError = (state) => state.createRole.error;
export const selectCreateRoleMessage = (state) => state.createRole.message;
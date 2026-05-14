// src/store/slices/changePasswordSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadConfig } from './configService';

let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig(); // assuming loadConfig() returns a Promise
  }
  return cachedConfigPromise;
}

export const updatePassword = createAsyncThunk(
  'changePassword/updatePassword',
  async (payload, { rejectWithValue }) => {

    
    const apiConfig = await getApiConfig();
    const url = `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/updatePassword`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update password');
      }

      // Since response is plain text
      const text = await response.text();
      console.log('Update Password Response:', text);
      return text; // "Password updated successfully"
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update password');
    }
  }
);

const changePasswordSlice = createSlice({
  name: 'changePassword',
  initialState: {
    loading: false,
    success: false,
    error: null,
    message: null,
  },
  reducers: {
    resetChangePasswordState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload;
        state.error = null;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Unknown error while updating password';
      });
  },
});

export const { resetChangePasswordState } = changePasswordSlice.actions;
export default changePasswordSlice.reducer;

// Selectors
export const selectChangePasswordLoading = (state) => state.changePassword.loading;
export const selectChangePasswordSuccess = (state) => state.changePassword.success;
export const selectChangePasswordError = (state) => state.changePassword.error;
export const selectChangePasswordMessage = (state) => state.changePassword.message;
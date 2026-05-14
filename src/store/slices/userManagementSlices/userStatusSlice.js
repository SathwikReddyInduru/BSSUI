// src/ReduxStore/slices/userStatusSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadConfig } from '../../../services/configService';
let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig(); // assuming loadConfig() returns a Promise
  }
  return cachedConfigPromise;
}

export const updateUserStatus = createAsyncThunk(
  'userStatus/updateUserStatus',
  async ({ loginId, networkId, action }, { rejectWithValue }) => {
    const apiConfig = await getApiConfig();
    const url = `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/userStatus`;
    //const url = 'http://10.10.19.172:8092/api/userStatus';

    const payload = {
      loginId,
      networkId,
      action, // "AC" or "DA"
    };

    console.log('📤 API Request:', { url, payload });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('📥 API Response Status:', response.status);

      if (!response.ok) {
        const errText = await response.text();
        console.log('❌ API Error Response:', errText);
        return rejectWithValue(errText || `Server error ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Success Response:', data);

      // Validate response - YOUR API returns responseCode as string "200"
      if (data.responseCode !== "200") {
        console.log('⚠️ Invalid response code:', data.responseCode);
        return rejectWithValue(data.message || 'Status update failed');
      }

      // CRITICAL: Return the data with the message from API
      const displayStatus = data.statusCode === 'AC' ? 'ACTIVE' : 'INACTIVE';
      const resultMessage = `User ${data.loginId} status changed to ${displayStatus}`;

      console.log('📦 Returning payload:', {
        loginId: data.loginId,
        displayStatus,
        message: resultMessage
      });

      return {
        loginId: data.loginId,
        statusCode: data.statusCode,
        displayStatus: displayStatus,
        message: resultMessage
      };

    } catch (err) {
      console.log('❌ Network Error:', err);
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

const userStatusSlice = createSlice({
  name: 'userStatus',
  initialState: {
    loading: false,
    success: false,
    error: null,
    message: null,
    updatedUser: null,
  },
  reducers: {
    resetUserStatusState: (state) => {
      console.log('🔄 Resetting user status state');
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = null;
      state.updatedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserStatus.pending, (state) => {
        console.log('⏳ updateUserStatus.pending');
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = null;
        state.updatedUser = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        console.log('✅✅✅ updateUserStatus.fulfilled - SETTING SUCCESS=TRUE', action.payload);
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.updatedUser = action.payload.loginId;
        state.error = null;
        console.log('📊 New state after fulfilled:', {
          success: state.success,
          message: state.message
        });
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        console.log('❌ updateUserStatus.rejected', action.payload);
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Failed to update user status';
        state.message = null;
        state.updatedUser = null;
      });
  },
});

export const { resetUserStatusState } = userStatusSlice.actions;
export default userStatusSlice.reducer;

// Selectors - CRITICAL: Use ?? instead of ||
export const selectUserStatusLoading = (state) => state.userStatus?.loading ?? false;
export const selectUserStatusSuccess = (state) => state.userStatus?.success ?? false;
export const selectUserStatusError = (state) => state.userStatus?.error ?? null;
export const selectUserStatusMessage = (state) => state.userStatus?.message ?? null;
export const selectUpdatedUser = (state) => state.userStatus?.updatedUser ?? null;
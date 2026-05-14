// src/ReduxStore/slices/userCreationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadConfig } from '../../../services/configService';

let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig();
  }
  return cachedConfigPromise;
}

export const createUser = createAsyncThunk(
  'userCreation/createUser',
  async (userData, { rejectWithValue }) => {
    if (!userData || !userData.loginId) {   // basic guard – adjust fields as needed
      return rejectWithValue('Missing required user data');
    }

    try {
      const config = await getApiConfig();

      const fullUrl = `http://${config.api.server}:${config.api.port.port_1}/api/createUser`;

      console.log('Creating user – sending to:', fullUrl);
      console.log('Payload:', userData);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`   ← add if your API requires auth
        },
        body: JSON.stringify(userData),
      });

      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = response.ok
          ? { errorCode: '0', errorDesc: text || 'Success', message: text }
          : { errorCode: 'unknown', errorDesc: text || 'Server error' };
      }

      if (!response.ok) {
        // Handle known backend error codes
        if (data?.errorCode === '50006' || data?.errorCode === 50006) {
          return rejectWithValue('Login ID already exists. Please choose a different one.');
        }
        const errorMsg =
          data?.message ||
          data?.errorDesc ||
          data?.error ||
          `Server error (${response.status})`;
        return rejectWithValue(errorMsg);
      }

      console.log('User created successfully:', data);
      return data;

    } catch (err) {
      console.error('createUser failed:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        return rejectWithValue('Network failure – cannot reach server (CORS / wrong URL / offline?)');
      }
      return rejectWithValue(err.message || 'Failed to create user – check network/console');
    }
  }
);

const userCreationSlice = createSlice({
  name: 'userCreation',
  initialState: {
    loading: false,
    success: false,
    error: null,
    data: null,
    // errorCode & errorDesc not really needed in state – usually kept in `error` object
  },
  reducers: {
    resetUserCreationState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.data = null;
    },
    clearUserCreationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const { resetUserCreationState, clearUserCreationError } = userCreationSlice.actions;
export default userCreationSlice.reducer;

// Selectors (unchanged)
export const selectUserCreationLoading = (state) => state.userCreation?.loading || false;
export const selectUserCreationSuccess = (state) => state.userCreation?.success || false;
export const selectUserCreationError = (state) => state.userCreation?.error || null;
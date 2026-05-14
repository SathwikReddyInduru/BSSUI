// src/ReduxStore/slices/userListSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadConfig } from '../../../services/configService';

let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig(); // assuming loadConfig() returns a Promise
  }
  return cachedConfigPromise;
}

export const fetchUserList = createAsyncThunk(
  'userList/fetchUserList',
  async (networkId, { rejectWithValue }) => {
    const apiConfig = await getApiConfig();
    const url = `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/viewAllUsers/${networkId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user list. Network error or server unavailable.');
      }

      const data = await response.json();
      console.log('User List API Response:', data);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Unknown error occurred while fetching user list');
    }
  }
);

const userListSlice = createSlice({
  name: 'userList',
  initialState: {
    loading: false,
    success: false,
    error: null,
    data: [],
    errorCode: null,
    errorDesc: null
  },
  reducers: {
    resetUserListState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.data = [];
      state.errorCode = null;
      state.errorDesc = null;
    },
    clearUserListError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserList.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(fetchUserList.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchUserList.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Unknown error occurred while fetching user list';
      });
  }
});

export const { resetUserListState, clearUserListError } = userListSlice.actions;
export default userListSlice.reducer;

// Selectors
export const selectUserListLoading = (state) => state.userList.loading;
export const selectUserListSuccess = (state) => state.userList.success;
export const selectUserListError = (state) => state.userList.error;
export const selectUserListData = (state) => state.userList.data;
export const selectUserListErrorCode = (state) => state.userList.errorCode;
export const selectUserListErrorDesc = (state) => state.userList.errorDesc;
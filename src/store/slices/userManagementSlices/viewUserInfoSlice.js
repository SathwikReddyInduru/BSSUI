import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadConfig } from '../../../services/configService'; // adjust path if needed

// Optional: cache the config promise globally so it's only loaded once across all thunks/calls
let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig();
  }
  return cachedConfigPromise;
}

export const fetchUserInfo = createAsyncThunk(
  'viewUserInfo/fetchUserInfo',
  async ({ loginId, networkId }, { rejectWithValue }) => {
    try {
      const apiConfig = await getApiConfig();
      const BASE_URL = `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api`;

      const response = await fetch(`${BASE_URL}/viewUserInfo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, networkId }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return rejectWithValue(errText || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      return data; // { firstName, middleName, lastName, address, city, email, validityDate, creationDate, statusCode, statusDate, ... }
    } catch (err) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

// The rest of the slice remains unchanged
const viewUserInfoSlice = createSlice({
  name: 'viewUserInfo',
  initialState: {
    loading: false,
    data: null,
    error: null,
  },
  reducers: {
    resetViewUserInfo: (state) => {
      state.loading = false;
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user info';
        state.data = null;
      });
  },
});

export const { resetViewUserInfo } = viewUserInfoSlice.actions;
export default viewUserInfoSlice.reducer;
// Selectors
export const selectViewUserInfoLoading = (state) => state.viewUserInfo?.loading ?? false;
export const selectViewUserInfoData = (state) => state.viewUserInfo?.data ?? null;
export const selectViewUserInfoError = (state) => state.viewUserInfo?.error ?? null;
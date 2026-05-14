import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadConfig } from './configService';

let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig();
  }
  return cachedConfigPromise;
}

export const fetchNetworkList = createAsyncThunk(
  'networkList/fetchNetworkList',
  async (requestPayload = {}, { rejectWithValue }) => {   // ✅ Accept payload
    try {
      const apiConfig = await getApiConfig();

      const url = `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/getNetworks`;

      const response = await fetch(url, {
        method: 'POST',                                    // ✅ POST not GET
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),              // ✅ Send body
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Network List API Response:', data);
      return data;

    } catch (err) {
      return rejectWithValue(err.message || 'Unknown error occurred');
    }
  }
);

const networkListSlice = createSlice({
  name: 'networkList',
  initialState: {
    loading: false,
    success: false,
    error: null,
    data: [],
    errorCode: null,
    errorDesc: null
  },
  reducers: {
    resetNetworkListState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.data = [];
      state.errorCode = null;
      state.errorDesc = null;
    },
    clearNetworkListError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNetworkList.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(fetchNetworkList.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchNetworkList.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Unknown error occurred';
      });
  }
});

export const { resetNetworkListState, clearNetworkListError } = networkListSlice.actions;
export default networkListSlice.reducer;

export const selectNetworkListLoading  = (state) => state.networkList.loading;
export const selectNetworkListSuccess  = (state) => state.networkList.success;
export const selectNetworkListError    = (state) => state.networkList.error;
export const selectNetworkListData     = (state) => state.networkList.data;
export const selectNetworkListErrorCode = (state) => state.networkList.errorCode;
export const selectNetworkListErrorDesc = (state) => state.networkList.errorDesc;
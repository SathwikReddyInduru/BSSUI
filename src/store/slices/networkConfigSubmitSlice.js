// src/store/slices/networkConfigSubmitSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadConfig } from './configService'; 

let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) cachedConfigPromise = loadConfig();
  return cachedConfigPromise;
}

export const submitNetworkConfig = createAsyncThunk(
  'networkConfigSubmit/submit',
  async (payload, { rejectWithValue }) => {
    try {
      const apiConfig = await getApiConfig();
      const BASE_URL = `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api`;

      const response = await fetch(`${BASE_URL}/submitConfig`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return rejectWithValue(errorText || `HTTP error ${response.status}`);
      }

      const result = await response.json();
      return result; // e.g. { message: "Update Successful" }
    } catch (err) {
      return rejectWithValue(err.message || 'Network error during submit');
    }
  }
);

const initialState = {
  status: 'idle',          // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  lastSubmittedAt: null,
  lastResponse: null,      // optional: store success response if needed
};

const networkConfigSubmitSlice = createSlice({
  name: 'networkConfigSubmit',
  initialState,
  reducers: {
    resetSubmitState: (state) => {
      state.status = 'idle';
      state.error = null;
      state.lastSubmittedAt = null;
      state.lastResponse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitNetworkConfig.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(submitNetworkConfig.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastSubmittedAt = new Date().toISOString();
        state.lastResponse = action.payload;
      })
      .addCase(submitNetworkConfig.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetSubmitState } = networkConfigSubmitSlice.actions;
export default networkConfigSubmitSlice.reducer;

// Selectors
export const selectSubmitStatus = (state) => state.networkConfigSubmit.status;
export const selectSubmitError = (state) => state.networkConfigSubmit.error;
export const selectIsSubmitting = (state) => state.networkConfigSubmit.status === 'loading';
export const selectSubmitSuccess = (state) => state.networkConfigSubmit.status === 'succeeded';
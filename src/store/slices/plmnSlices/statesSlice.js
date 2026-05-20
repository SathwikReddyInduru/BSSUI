// src/ReduxStore/slices/statesSlice.js
// src/ReduxStore/slices/statesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadConfig } from "../../../services/configService"; // adjust path if needed

let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig();
  }
  return cachedConfigPromise;
}

export const fetchStates = createAsyncThunk(
  'states/fetchStates',
  async (countryCode, { rejectWithValue }) => {
    if (!countryCode) {
      return [];
    }

    try {
      const config = await getApiConfig();

      const baseUrl = `http://${config.api.server}:${config.api.port.port_1}`;
      const endpoint = '/api/getStates';
      const fullUrl = `${baseUrl}${endpoint}`;

      console.log('Fetching states from:', fullUrl);
      console.log('Country code:', countryCode);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ countryCode }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Server responded ${response.status} – ${errorText || 'Failed to fetch states'}`);
      }

      const data = await response.json();
      console.log('States API Response:', data);

      return data;
    } catch (err) {
      console.error('fetchStates failed:', err);
      return rejectWithValue(err.message || 'Failed to load states');
    }
  }
);

// rest of the slice remains the same...

const statesSlice = createSlice({
  name: 'states',
  initialState: {
    loading: false,
    data: [],
    error: null,
  },
  reducers: {
    clearStates: (state) => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('Fetching states...'); // Debug log
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        console.log('States fetched successfully:', action.payload); // Debug log
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
        console.error('Error fetching states:', action.payload); // Debug log
      });
  },
});

export const { clearStates } = statesSlice.actions;
export default statesSlice.reducer;

// Selectors
export const selectStatesLoading = (state) => state.states.loading;
export const selectStatesData = (state) => state.states.data;
export const selectStatesError = (state) => state.states.error;
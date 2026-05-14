// src/ReduxStore/slices/workgroupSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadConfig } from '../../../services/configService';

let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig();
  }
  return cachedConfigPromise;
}

export const fetchWorkgroups = createAsyncThunk(
  'workgroup/fetchWorkgroups',
  async (networkId, { rejectWithValue }) => {
    if (!networkId) {
      return [];
    }

    try {
      const config = await getApiConfig();

      // Build URL properly (string concatenation)
      const fullUrl = `http://${config.api.server}:${config.api.port.port_1}/api/getWorkgroupId/${networkId}`;

      console.log('Fetching workgroups from:', fullUrl);
      console.log('Network ID:', networkId);

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header here if your API requires it
          // 'Authorization': `Bearer ${someToken}`,
        },
      });

      if (!response.ok) {
        let errorDetail = '';
        try {
          errorDetail = await response.text();
        } catch { }
        throw new Error(
          `Server responded ${response.status} – ${errorDetail || 'Failed to fetch workgroups'}`
        );
      }

      const data = await response.json();
      console.log('Workgroups API Response:', data);
      return data;

    } catch (err) {
      console.error('fetchWorkgroups failed:', err);
      return rejectWithValue(err.message || 'Failed to load workgroups');
    }
  }
);

const workgroupSlice = createSlice({
  name: 'workgroup',
  initialState: {
    loading: false,
    data: [],
    error: null,
  },
  reducers: {
    clearWorkgroups: (state) => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkgroups.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('Fetching workgroups...');
      })
      .addCase(fetchWorkgroups.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        console.log('Workgroups fetched successfully');
      })
      .addCase(fetchWorkgroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = [];
        console.error('Error fetching workgroups:', action.payload);
      });
  },
});

export const { clearWorkgroups } = workgroupSlice.actions;
export default workgroupSlice.reducer;

// Selectors (unchanged)
export const selectWorkgroupsLoading = (state) => state.workgroup.loading;
export const selectWorkgroupsData = (state) => state.workgroup.data;
export const selectWorkgroupsError = (state) => state.workgroup.error;
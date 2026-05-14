// 1. First, create this Redux slice
// features/networkConfig/networkConfigSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


import { loadConfig } from './configService'; // adjust path

let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) cachedConfigPromise = loadConfig();
  return cachedConfigPromise;
}
//const API_URL = 'http://10.10.19.157:8092/api/networkConfig';
const apiConfig = await getApiConfig();
  const API_URL = `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/networkConfig`;


export const fetchNetworkConfig = createAsyncThunk(
  'networkConfig/fetchNetworkConfig',
  async ({ networkId, networkName }, { rejectWithValue }) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ networkId: Number(networkId), networkName }),
      });

      if (!res.ok) throw new Error('Network config fetch failed');
      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  data: null,           // networkDetails[0]
  airtimeCalendars: [],
  pstnCalendars: [],
  statusCode:"",
  networkCode:null,
  status: 'idle',       // idle | loading | succeeded | failed
  error: null,
};

const networkConfigSlice = createSlice({
  name: 'networkConfig',
  initialState,
  reducers: {
    resetNetworkConfig: (state) => {
      state.data = null;
      state.airtimeCalendars = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNetworkConfig.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNetworkConfig.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload.networkDetails?.[0] || {};
        state.statusCode=action.payload.statusCode || {};
        state.networkCode=action.payload.networkCode|| {};
        state.airtimeCalendars = action.payload.airtimeCalendars || [];
        state.pstnCalendars = action.payload.pstnCalendars || [];
      })
      .addCase(fetchNetworkConfig.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetNetworkConfig } = networkConfigSlice.actions;
export default networkConfigSlice.reducer;
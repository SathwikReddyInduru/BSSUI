// src/store/slices/countriesSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosService from '../../services/AxiosService';
import { loadConfig } from './configService'; // Keep for production


let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig(); // assuming loadConfig() returns a Promise
  }
  return cachedConfigPromise;
}

export const fetchCountries = createAsyncThunk(
  'countries/fetchCountries',
  async (_, { rejectWithValue }) => {
    try {
      // Uncomment below when using dynamic config
       const apiConfig = await getApiConfig();
       const url = `http://${apiConfig.api.server}:${apiConfig.api.port.port_1}/api/countries`;

      // Hardcoded for reliable testing (you said API works at this URL)
      //const url = 'http://10.10.19.172:8092/api/countries';

      console.log('Fetching countries from:', url); // Visible in browser console

      const response = await axiosService.get(url);

      console.log('Countries API Response:', response.data); // You should see your full list here

      if (!Array.isArray(response.data)) {
        throw new Error('Expected array of countries');
      }

      return response.data;
    } catch (err) {
      console.error('Error fetching countries:', err);

      let errorMessage = 'Failed to fetch countries';

      if (err.message.includes('Network Error')) {
        errorMessage = 'Network Error: Cannot reach server. Check VPN/connection.';
      } else if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found (404)';
      } else {
        errorMessage = err.response?.data?.message || err.message || errorMessage;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

const countriesSlice = createSlice({
  name: 'countries',
  initialState: {
    loading: false,
    error: null,
    countriesList: [],
    countryOptions: [{ label: 'Select Country', value: '' }], // Use empty string value
  },
  reducers: {
    resetCountriesState: (state) => {
      state.loading = false;
      state.error = null;
      state.countriesList = [];
      state.countryOptions = [{ label: 'Select Country', value: '' }];
    },
    clearCountriesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.countryOptions = [{ label: 'Loading countries...', value: '' }];
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.countriesList = action.payload;

        // Sort alphabetically by country name (optional but user-friendly)
        const sortedCountries = [...action.payload].sort((a, b) =>
          a.countryDesc.trim().localeCompare(b.countryDesc.trim())
        );

        state.countryOptions = [
          { label: 'Select Country', value: '' }, // Default placeholder
          ...sortedCountries.map((country) => ({
            label: country.countryDesc.trim(),
            value: country.countryCode.trim(), // e.g., "IN", "US"
          })),
        ];

        console.log('Country options updated:', state.countryOptions.length, 'options');
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false;
        state.countriesList = [];
        state.countryOptions = [{ label: 'Select Country', value: '' }];
        state.error = action.payload || 'Failed to load countries';

        console.error('Countries fetch failed:', state.error);
      });
  },
});

export const { resetCountriesState, clearCountriesError } = countriesSlice.actions;

// Selectors
export const selectCountryOptions = (state) => state.countries.countryOptions;
export const selectCountriesLoading = (state) => state.countries.loading;
export const selectCountriesError = (state) => state.countries.error;
export const selectCountriesList = (state) => state.countries.countriesList;



export const countriesReducer = countriesSlice.reducer;
export default countriesSlice.reducer;

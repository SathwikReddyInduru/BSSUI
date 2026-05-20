// src/ReduxStore/slices/roleDeleteSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosService from '../../../services/AxiosService';
import { loadConfig } from '../../../services/configService';

let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig(); // ← fixed: call loadConfig, not getApiConfig
  }
  return cachedConfigPromise;
}

// ─── Check users using the role ───
export const checkRoleUsage = createAsyncThunk(
  'roleDelete/checkRoleUsage',
  async ({ networkId, roleId }, { rejectWithValue }) => {
    if (!networkId || !roleId) {
      return rejectWithValue('networkId and roleId are required');
    }

    try {
      const config = await getApiConfig();

      const url = `http://${config.api.server}:${config.api.port.port_1}/api/getLoginDtls`;

      console.log('[checkRoleUsage] →', url);
      console.log('[checkRoleUsage] payload →', { networkId, roleId });

      const response = await axiosService.post(url, { networkId, roleId }, {
        headers: { 'Content-Type': 'application/json' },
        // timeout: 10000,              // optional
        // withCredentials: true,       // if cookies/auth needed
      });

      return response.data;

    } catch (error) {
      console.error('[checkRoleUsage] failed:', error);

      if (error.response) {
        return rejectWithValue(
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error (${error.response.status})`
        );
      }

      if (error.request) {
        return rejectWithValue('No response from server – network/CORS/wrong URL?');
      }

      return rejectWithValue(error.message || 'Failed to check role usage');
    }
  }
);

// ─── Delete the role ───
export const deleteRole = createAsyncThunk(
  'roleDelete/deleteRole',
  async ({ networkId, roleId }, { rejectWithValue }) => {
    if (!networkId || !roleId) {
      return rejectWithValue('networkId and roleId are required');
    }

    try {
      const config = await getApiConfig();

      const url = `http://${config.api.server}:${config.api.port.port_1}/api/deleteRole`;

      console.log('[deleteRole] →', url);
      console.log('[deleteRole] payload →', { networkId, roleId });

      const response = await axiosService.post(url, { networkId, roleId }, {
        headers: { 'Content-Type': 'application/json' },
      });

      return response.data;

    } catch (error) {
      console.error('[deleteRole] failed:', error);

      if (error.response) {
        return rejectWithValue(
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error (${error.response.status})`
        );
      }

      if (error.request) {
        return rejectWithValue('No response – check network, CORS, server running?');
      }

      return rejectWithValue(error.message || 'Failed to delete role');
    }
  }
);

const initialState = {
  usageData: null,           // { roleName, loginIds: [] } or whatever shape you get
  usageLoading: false,
  usageError: null,

  deleteLoading: false,
  deleteError: null,
  deleteSuccess: false,
};

const roleDeleteSlice = createSlice({
  name: 'roleDelete',
  initialState,
  reducers: {
    clearDeleteState: (state) => {
      state.usageData = null;
      state.usageLoading = false;
      state.usageError = null;
      state.deleteLoading = false;
      state.deleteError = null;
      state.deleteSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // Check usage
    builder
      .addCase(checkRoleUsage.pending, (state) => {
        state.usageLoading = true;
        state.usageError = null;
      })
      .addCase(checkRoleUsage.fulfilled, (state, action) => {
        state.usageLoading = false;
        state.usageData = action.payload;
      })
      .addCase(checkRoleUsage.rejected, (state, action) => {
        state.usageLoading = false;
        state.usageError = action.payload;
      });

    // Delete role
    builder
      .addCase(deleteRole.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteRole.fulfilled, (state) => {
        state.deleteLoading = false;
        state.deleteSuccess = true;
        // Optional: store response data/message if backend returns something useful
        // state.deleteMessage = action.payload?.message || 'Role deleted';
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  },
});

export const { clearDeleteState } = roleDeleteSlice.actions;

export const selectRoleUsageData = (state) => state.roleDelete.usageData;
export const selectRoleUsageLoading = (state) => state.roleDelete.usageLoading;
export const selectRoleUsageError = (state) => state.roleDelete.usageError;

export const selectRoleDeleteLoading = (state) => state.roleDelete.deleteLoading;
export const selectRoleDeleteError = (state) => state.roleDelete.deleteError;
export const selectRoleDeleteSuccess = (state) => state.roleDelete.deleteSuccess;

export default roleDeleteSlice.reducer;

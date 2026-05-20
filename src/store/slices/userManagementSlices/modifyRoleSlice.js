// src/ReduxStore/slices/modifyRoleSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadConfig } from '@/services/configService.js';

let cachedConfigPromise = null;

async function getApiConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = loadConfig();
  }
  return cachedConfigPromise;
}

export const modifyRole = createAsyncThunk(
    'modifyRole/modifyRole',
    async (payload, { rejectWithValue }) => {
      if (!payload || !payload.networkId || !payload.roleId) {
        return rejectWithValue('Missing required fields: networkId and roleId');
      }

      try {
        const config = await getApiConfig();

        const fullUrl = `http://${config.api.server}:${config.api.port.port_1}/api/roleModify`;

        console.log('[modifyRole] Sending to:', fullUrl);
        console.log('[modifyRole] Payload:', payload);

        // FIX: Deduplicate privileges at the slice level as a final safety guard
        const deduplicatedPayload = {
          ...payload,
          privileges: [...new Set(payload.privileges)],
        };

        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}`   ← uncomment + provide token if needed
          },
          body: JSON.stringify(deduplicatedPayload),
        });

        let data;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = { message: text || (response.ok ? 'Success' : 'Server error') };
        }

        if (!response.ok) {
          const errorMsg =
              data?.message ||
              data?.error ||
              data?.errorDesc ||
              `Server responded with status ${response.status}`;
          throw new Error(errorMsg);
        }

        console.log('[modifyRole] Raw API response:', data);
        return data;

      } catch (err) {
        console.error('[modifyRole] Error:', err);
        const friendlyError =
            err.message?.includes('fetch') || err.message?.includes('network')
                ? 'Cannot reach server – check URL, network, CORS or firewall'
                : err.message || 'Failed to modify role';
        return rejectWithValue(friendlyError);
      }
    }
);

const modifyRoleSlice = createSlice({
  name: 'modifyRole',
  initialState: {
    loading: false,
    success: false,
    error: null,
    message: null,
    data: null,
  },
  reducers: {
    resetModifyRole: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = null;
      state.data = null;
    },
    clearModifyRoleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
        .addCase(modifyRole.pending, (state) => {
          state.loading = true;
          state.success = false;
          state.error = null;
          state.message = null;
        })
        .addCase(modifyRole.fulfilled, (state, action) => {
          state.loading = false;
          state.success = true;
          state.data = action.payload;
          // FIX: Replaced short-circuit boolean expression with explicit conditional
          // to avoid storing `false` as the message when status !== 'success'
          state.message =
              action.payload?.message ||
              action.payload?.successMessage ||
              (action.payload?.status === 'success'
                  ? 'Role modified successfully'
                  : 'Role updated');
          state.error = null;
        })
        .addCase(modifyRole.rejected, (state, action) => {
          state.loading = false;
          state.success = false;
          state.message = null;
          state.error = action.payload || 'Failed to modify role';
        });
  },
});

export const { resetModifyRole, clearModifyRoleError } = modifyRoleSlice.actions;
export default modifyRoleSlice.reducer;

// Selectors
export const selectModifyRoleLoading = (state) => state.modifyRole.loading;
export const selectModifyRoleSuccess = (state) => state.modifyRole.success;
export const selectModifyRoleError = (state) => state.modifyRole.error;
export const selectModifyRoleMessage = (state) => state.modifyRole.message;
export const selectModifyRoleData = (state) => state.modifyRole.data;
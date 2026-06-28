import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '../../api/endpoints/authApi';

const initialState = {
  accessToken: null,
  user: null, // { userId, username, email, role, employeeId }
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  initializing: true, // true until we've attempted a silent refresh on app load
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ usernameOrEmail, password }, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login(usernameOrEmail, password);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } catch {
    // Even if the server call fails, we still want to clear local state
  }
  return true;
});

export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authApi.refresh();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Session expired');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Called by the axios interceptor when a background refresh succeeds mid-request
    tokenRefreshed: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.user = {
        userId: action.payload.userId,
        username: action.payload.username,
        email: action.payload.email,
        role: action.payload.role,
        employeeId: action.payload.employeeId,
      };
    },
    sessionExpired: (state) => {
      state.accessToken = null;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload.accessToken;
        state.user = {
          userId: action.payload.userId,
          username: action.payload.username,
          email: action.payload.email,
          role: action.payload.role,
          employeeId: action.payload.employeeId,
        };
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.accessToken = null;
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.accessToken = null;
        state.user = null;
        state.status = 'idle';
      })
      .addCase(refreshSession.pending, (state) => {
        state.initializing = true;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.user = {
          userId: action.payload.userId,
          username: action.payload.username,
          email: action.payload.email,
          role: action.payload.role,
          employeeId: action.payload.employeeId,
        };
        state.initializing = false;
      })
      .addCase(refreshSession.rejected, (state) => {
        state.accessToken = null;
        state.user = null;
        state.initializing = false;
      });
  },
});

export const { tokenRefreshed, sessionExpired } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import leaveApi from '../../api/endpoints/leaveApi';

const initialState = {
  myRequests: [],
  myBalance: [],
  pending: [],
  leaveTypes: [],
  status: 'idle',
  error: null,
  pagination: { page: 0, size: 20, totalElements: 0, totalPages: 0 },
};

export const applyLeave = createAsyncThunk(
  'leave/apply',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await leaveApi.apply(payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to submit leave request');
    }
  }
);

export const fetchMyLeaveRequests = createAsyncThunk(
  'leave/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await leaveApi.getMine();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load leave requests');
    }
  }
);

export const fetchMyLeaveBalance = createAsyncThunk(
  'leave/fetchMyBalance',
  async (year, { rejectWithValue }) => {
    try {
      const { data } = await leaveApi.getMyBalance(year);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load leave balance');
    }
  }
);

export const fetchPendingLeaveRequests = createAsyncThunk(
  'leave/fetchPending',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await leaveApi.getPending(params);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load pending requests');
    }
  }
);

export const approveLeaveRequest = createAsyncThunk(
  'leave/approve',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await leaveApi.approve(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to approve leave');
    }
  }
);

export const rejectLeaveRequest = createAsyncThunk(
  'leave/reject',
  async ({ id, rejectionReason }, { rejectWithValue }) => {
    try {
      const { data } = await leaveApi.reject(id, rejectionReason);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to reject leave');
    }
  }
);

export const fetchLeaveTypes = createAsyncThunk(
  'leave/fetchTypes',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await leaveApi.getLeaveTypes();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load leave types');
    }
  }
);

function removeFromPending(state, id) {
  state.pending = state.pending.filter((r) => r.id !== id);
}

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.myRequests.unshift(action.payload);
      })
      .addCase(fetchMyLeaveRequests.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMyLeaveRequests.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.myRequests = action.payload;
      })
      .addCase(fetchMyLeaveRequests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchMyLeaveBalance.fulfilled, (state, action) => {
        state.myBalance = action.payload;
      })
      .addCase(fetchPendingLeaveRequests.fulfilled, (state, action) => {
        state.pending = action.payload.content;
        state.pagination = {
          page: action.payload.page,
          size: action.payload.size,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(approveLeaveRequest.fulfilled, (state, action) => {
        removeFromPending(state, action.payload.id);
      })
      .addCase(rejectLeaveRequest.fulfilled, (state, action) => {
        removeFromPending(state, action.payload.id);
      })
      .addCase(fetchLeaveTypes.fulfilled, (state, action) => {
        state.leaveTypes = action.payload;
      });
  },
});

export default leaveSlice.reducer;

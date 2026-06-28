import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import attendanceApi from '../../api/endpoints/attendanceApi';

const initialState = {
  myHistory: [],
  todaySummary: null,
  report: [],
  status: 'idle',
  error: null,
  pagination: { page: 0, size: 20, totalElements: 0, totalPages: 0 },
};

export const checkIn = createAsyncThunk('attendance/checkIn', async (_, { rejectWithValue }) => {
  try {
    const { data } = await attendanceApi.checkIn();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Check-in failed');
  }
});

export const checkOut = createAsyncThunk('attendance/checkOut', async (_, { rejectWithValue }) => {
  try {
    const { data } = await attendanceApi.checkOut();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Check-out failed');
  }
});

export const fetchMyAttendance = createAsyncThunk(
  'attendance/fetchMine',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await attendanceApi.getOwnHistory(params);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load attendance');
    }
  }
);

export const fetchTodaySummary = createAsyncThunk(
  'attendance/fetchTodaySummary',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await attendanceApi.getTodaySummary();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load summary');
    }
  }
);

export const fetchAttendanceReport = createAsyncThunk(
  'attendance/fetchReport',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await attendanceApi.getReport(params);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load report');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkIn.fulfilled, (state, action) => {
        state.myHistory.unshift(action.payload);
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        const idx = state.myHistory.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.myHistory[idx] = action.payload;
      })
      .addCase(fetchMyAttendance.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.myHistory = action.payload;
      })
      .addCase(fetchMyAttendance.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchTodaySummary.fulfilled, (state, action) => {
        state.todaySummary = action.payload;
      })
      .addCase(fetchAttendanceReport.fulfilled, (state, action) => {
        state.report = action.payload.content;
        state.pagination = {
          page: action.payload.page,
          size: action.payload.size,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
        };
      });
  },
});

export default attendanceSlice.reducer;

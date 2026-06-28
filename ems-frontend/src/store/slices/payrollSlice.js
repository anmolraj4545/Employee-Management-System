import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import payrollApi from '../../api/endpoints/payrollApi';

const initialState = {
  myPayslips: [],
  monthlyPayroll: [],
  monthlySummary: null,
  status: 'idle',
  error: null,
  pagination: { page: 0, size: 20, totalElements: 0, totalPages: 0 },
};

export const fetchMyPayslips = createAsyncThunk(
  'payroll/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await payrollApi.getMyPayslips();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load payslips');
    }
  }
);

export const generatePayroll = createAsyncThunk(
  'payroll/generate',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await payrollApi.generatePayroll(payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to generate payroll');
    }
  }
);

export const fetchMonthlyPayroll = createAsyncThunk(
  'payroll/fetchMonthly',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await payrollApi.getMonthlyPayroll(params);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load payroll');
    }
  }
);

export const fetchMonthlySummary = createAsyncThunk(
  'payroll/fetchMonthlySummary',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const { data } = await payrollApi.getMonthlySummary(month, year);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load payroll summary');
    }
  }
);

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPayslips.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMyPayslips.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.myPayslips = action.payload;
      })
      .addCase(fetchMyPayslips.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchMonthlyPayroll.fulfilled, (state, action) => {
        state.monthlyPayroll = action.payload.content;
        state.pagination = {
          page: action.payload.page,
          size: action.payload.size,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchMonthlySummary.fulfilled, (state, action) => {
        state.monthlySummary = action.payload;
      });
  },
});

export default payrollSlice.reducer;

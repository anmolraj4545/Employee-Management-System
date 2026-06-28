import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import employeeApi from '../../api/endpoints/employeeApi';

const initialState = {
  items: [],
  current: null,
  dropdown: [],
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  pagination: { page: 0, size: 20, totalElements: 0, totalPages: 0 },
};

export const fetchEmployees = createAsyncThunk(
  'employees/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await employeeApi.getAll(params);
      return data.data; // PageResponse<EmployeeSummary>
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load employees');
    }
  }
);

export const fetchEmployeeById = createAsyncThunk(
  'employees/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await employeeApi.getById(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load employee');
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await employeeApi.create(payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create employee');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await employeeApi.update(id, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update employee');
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/delete',
  async (id, { rejectWithValue }) => {
    try {
      await employeeApi.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete employee');
    }
  }
);

export const fetchEmployeeDropdown = createAsyncThunk(
  'employees/fetchDropdown',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await employeeApi.getDropdown();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load employees');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearCurrentEmployee: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.content;
        state.pagination = {
          page: action.payload.page,
          size: action.payload.size,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.current = action.payload;
        const idx = state.items.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
      })
      .addCase(fetchEmployeeDropdown.fulfilled, (state, action) => {
        state.dropdown = action.payload;
      });
  },
});

export const { clearCurrentEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;

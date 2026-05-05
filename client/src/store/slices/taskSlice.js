import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/tasks');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks.');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/tasks', data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create task.');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/tasks/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update task.');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete task.');
    }
  }
);

const sortByPriority = (items) =>
  [...items].sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    socketTaskCreated(state, action) {
      if (!state.items.find((t) => t._id === action.payload._id)) {
        state.items = sortByPriority([action.payload, ...state.items]);
      }
    },
    socketTaskUpdated(state, action) {
      const idx = state.items.findIndex((t) => t._id === action.payload._id);
      if (idx !== -1) {
        state.items[idx] = action.payload;
        state.items = sortByPriority(state.items);
      }
    },
    socketTaskDeleted(state, action) {
      state.items = state.items.filter((t) => t._id !== action.payload._id);
    },
    clearTaskError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        if (!state.items.find((t) => t._id === action.payload._id)) {
          state.items = sortByPriority([action.payload, ...state.items]);
        }
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
        state.items = sortByPriority(state.items);
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
      });
  },
});

export const { socketTaskCreated, socketTaskUpdated, socketTaskDeleted, clearTaskError } =
  taskSlice.actions;
export default taskSlice.reducer;

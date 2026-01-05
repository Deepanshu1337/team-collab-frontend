import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../lib/axios';

export interface AdminStats {
  totalTeams: number;
  totalProjects: number;
  totalTasks: number;
}

export interface ManagerStats {
  totalManagedProjects: number;
  totalAssignedTasks: number;
  completedTasks: number;
  projects: { id: string; name: string }[];
}

export interface MemberStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number;
}

interface DashboardState {
  adminStats: AdminStats | null;
  managerStats: ManagerStats | null;
  memberStats: MemberStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  adminStats: null,
  managerStats: null,
  memberStats: null,
  loading: false,
  error: null,
};

// Thunks
export const fetchAdminStats = createAsyncThunk(
  'dashboard/fetchAdminStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/dashboard/admin');
      return response.data as AdminStats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin stats');
    }
  }
);

export const fetchManagerStats = createAsyncThunk(
  'dashboard/fetchManagerStats',
  async (teamId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/dashboard/${teamId}/manager`);
      return response.data as ManagerStats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch manager stats');
    }
  }
);

export const fetchMemberStats = createAsyncThunk(
  'dashboard/fetchMemberStats',
  async (teamId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/dashboard/${teamId}/member`);
      return response.data as MemberStats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch member stats');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard(state) {
      state.adminStats = null;
      state.managerStats = null;
      state.memberStats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Admin stats
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.adminStats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Manager stats
    builder
      .addCase(fetchManagerStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerStats.fulfilled, (state, action) => {
        state.loading = false;
        state.managerStats = action.payload;
      })
      .addCase(fetchManagerStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Member stats
    builder
      .addCase(fetchMemberStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberStats.fulfilled, (state, action) => {
        state.loading = false;
        state.memberStats = action.payload;
      })
      .addCase(fetchMemberStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;

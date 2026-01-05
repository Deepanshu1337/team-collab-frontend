import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../lib/axios';

export interface Project {
  _id: string;
  name: string;
  description?: string;
}

interface ProjectState {
  projects: Project[];
  status: 'idle' | 'loading' | 'failed';
}

const initialState: ProjectState = {
  projects: [],
  status: 'idle',
};

export const fetchProjects = createAsyncThunk('projects/fetch', async () => {
  const res = await axios.get('/api/projects');
  return res.data;
});

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'idle';
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default projectSlice.reducer;

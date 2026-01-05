import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import axios from "../lib/axios";
 

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  position: number;
  projectId: string;
  assignedTo?: any;
}

interface TaskState {
  byProject: Record<string, Task[]>;
  status: "idle" | "loading" | "failed";
}

const initialState: TaskState = {
  byProject: {},
  status: "idle",
};

export const fetchTasks = createAsyncThunk(
  "tasks/fetch",
  async ({ teamId, projectId }: { teamId: string; projectId: string }) => {
    const res = await axios.get(`/api/tasks/${teamId}/projects/${projectId}/tasks`);
    return { projectId, tasks: res.data };
  }
);

export const moveTask = createAsyncThunk(
  "tasks/move",
  async ({ teamId, taskId, status }: { teamId: string; taskId: string; status: "todo" | "in-progress" | "done" }) => {
    const res = await axios.put(`/api/tasks/${teamId}/tasks/${taskId}`, { status });
    return res.data;
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask(state, action: PayloadAction<{ projectId: string; task: Task }>) {
      const { projectId, task } = action.payload;
      state.byProject[projectId] = state.byProject[projectId] || [];
      state.byProject[projectId].unshift(task);
    },
    updateTask(state, action: PayloadAction<Task>) {
      const t = action.payload;
      const list = state.byProject[t.projectId] || [];
      const idx = list.findIndex((x) => x._id === t._id);
      if (idx >= 0) list[idx] = t;
    },
    deleteTask(state, action: PayloadAction<{ projectId: string; taskId: string }>) {
      const { projectId, taskId } = action.payload;
      state.byProject[projectId] = (state.byProject[projectId] || []).filter((t) => t._id !== taskId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "idle";
        state.byProject[action.payload.projectId] = action.payload.tasks;
      })
      .addCase(fetchTasks.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        const t = action.payload;
        // Replace or insert in project list
        const list = state.byProject[t.projectId] || [];
        const idx = list.findIndex((x) => x._id === t._id);
        if (idx >= 0) list[idx] = t;
        else list.push(t);
      });
  },
});

export const { addTask, updateTask, deleteTask } = taskSlice.actions;
export default taskSlice.reducer;

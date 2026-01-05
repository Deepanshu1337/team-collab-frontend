import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.slice';
import projectReducer from './project.slice';
import taskReducer from './task.slice';
import chatReducer from './chat.slice';
import dashboardReducer from './dashboard.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    tasks: taskReducer,
    chat: chatReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

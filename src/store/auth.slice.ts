import { createSlice } from '@reduxjs/toolkit';
import type {  PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: { uid: string; email?: string; name?: string; id?: string } | null;
  role: string | null;
  teamId: string | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  role: null,
  teamId: null,
  token: localStorage.getItem('fb_token') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<Partial<AuthState>>) {
      const { user, role, teamId, token } = action.payload;
      // Merge user object instead of overwriting (handle null state.user case)
      if (user) state.user = state.user ? { ...state.user, ...user } : (user as any);
      if (role !== undefined) state.role = role || null;
      if (teamId !== undefined) state.teamId = teamId || null;
      if (token !== undefined) {
        state.token = token || null;
        try {
          if (token) localStorage.setItem('fb_token', token);
          else localStorage.removeItem('fb_token');
        } catch (e) {
          // noop
        }
      }
    },
    logout(state) {
      state.user = null;
      state.role = null;
      state.teamId = null;
      state.token = null;
      try {
        localStorage.removeItem('fb_token');
      } catch (e) {}
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

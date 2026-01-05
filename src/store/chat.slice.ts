import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../lib/axios';

interface Message {
  _id: string;
  content: string;
  senderId: any;
  createdAt: string;
}

interface ChatState {
  messages: Message[];
  status: 'idle' | 'loading' | 'failed';
}

const initialState: ChatState = {
  messages: [],
  status: 'idle',
};

export const fetchMessages = createAsyncThunk('chat/fetch', async (teamId: string) => {
  const res = await axios.get(`/api/messages/${teamId}`);
  return res.data;
});

export const sendMessage = createAsyncThunk('chat/send', async ({ teamId, content }: { teamId: string; content: string }) => {
  const res = await axios.post(`/api/messages/${teamId}`, { content });
  return res.data;
});

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    appendMessage(state, action) {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = 'idle';
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { appendMessage } = chatSlice.actions;
export default chatSlice.reducer;

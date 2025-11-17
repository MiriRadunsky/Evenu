import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../api/axios';
import type { Message } from '../types/type';

export interface ChatState {
  messages: Message[];
  loading: boolean;
  error?: string;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: undefined,
};

// Fetch messages for a thread (server model: messages)
export const fetchMessages = createAsyncThunk<Message[], { threadId: string }>(
  'chat/fetchMessages',
  async ({ threadId }, { rejectWithValue }) => {
    try {
      // server might expose: GET /messages?threadId=... or GET /messages/:threadId
      const res = await api.get(`/messages`, { params: { threadId } });
      // Prefer res.data.data if API wraps payload, otherwise try res.data
      return (res.data?.data ?? res.data) as Message[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Error fetching messages');
    }
  }
);

export const sendMessage = createAsyncThunk<Message, { threadId: string; body: string }, { rejectValue: string }>(
  'chat/sendMessage',
  async ({ threadId, body }, { rejectWithValue }) => {
    try {
      const res = await api.post('/messages', { threadId, body });
      return (res.data?.data ?? res.data) as Message;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Error sending message');
    }
  }
);

export const updateMessage = createAsyncThunk<Message, { id: string; data: Partial<Message> }, { rejectValue: string }>(
  'chat/updateMessage',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/messages/${id}`, data);
      return (res.data?.data ?? res.data) as Message;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Error updating message');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
      state.error = undefined;
    },
    addLocalMessage: (state, action: PayloadAction<Message>) => {
      // for optimistic updates
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<Message[]>) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message;
      })

      .addCase(sendMessage.pending, (state) => {
        state.error = undefined;
      })
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<Message>) => {
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload as string || action.error.message;
      });
  },
});

export const { clearMessages, addLocalMessage } = chatSlice.actions;
export default chatSlice.reducer;

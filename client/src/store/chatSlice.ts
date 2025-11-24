import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../services/axios";
import type { Thread } from "../types/Thread";
import type { Message } from "../types/type";

// ==========================
//     STATE
// ==========================
export interface ChatState {
  threads: Thread[];
  messagesByThread: Record<string, Message[]>;
  loading: boolean;
  error?: string;
}

const initialState: ChatState = {
  threads: [],
  messagesByThread: {},
  loading: false,
  error: undefined,
};

// ==========================
//     THUNKS
// ==========================

// Fetch threads (user or supplier)
export const fetchThreads = createAsyncThunk<
  Thread[],
  { id: string; role: "user" | "supplier" },
  { rejectValue: string }
>("chat/fetchThreads", async ({ id, role }, { rejectWithValue }) => {
  try {
    const url = role === "supplier" ? `/threads/supplier/${id}` : `/threads/user/${id}`;
    const res = await api.get(url);
    // API צריך להחזיר גם שמות הצד השני (supplierName / clientName)
    console.log("[Thunk] fetchThreads response:", res.data);  // ✅ בדיקה כאן

    return res.data?.data ?? res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Error fetching threads");
  }
});

// Fetch messages for a thread
export const fetchMessages = createAsyncThunk<
  { threadId: string; messages: Message[] },
  { threadId: string },
  { rejectValue: string }
>("chat/fetchMessages", async ({ threadId }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/messages/${threadId}`);
    const messages = res.data?.data ?? res.data;
    return { threadId, messages };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Error fetching messages");
  }
});

// Send message
export const sendMessage = createAsyncThunk<
  Message,
  { threadId: string; body: string; from: string; to?: string },
  { rejectValue: string }
>("chat/sendMessage", async ({ threadId, body, from, to }, { rejectWithValue }) => {
  const data = { threadId, from, to, body };
  try {
    const res = await api.post("/messages", data);
    return res.data?.data ?? res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Error sending message");
  }
});

// Mark all messages in a thread as read
export const markThreadAsRead = createAsyncThunk<{ threadId: string }, { threadId: string }>(
  "chat/markThreadAsRead",
  async ({ threadId }) => {
    await api.patch(`/messages/read/${threadId}`);
    return { threadId };
  }
);

// ==========================
//     SLICE
// ==========================
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearMessages: (state, action: PayloadAction<string>) => {
      delete state.messagesByThread[action.payload];
    },
    addLocalMessage: (state, action: PayloadAction<Message>) => {
      const msg = action.payload;
      if (!state.messagesByThread[msg.threadId]) state.messagesByThread[msg.threadId] = [];
      state.messagesByThread[msg.threadId].push(msg);

      // סימון thread כחדש אם השולח הוא הצד השני
      const thread = state.threads.find(t => t._id === msg.threadId);
      if (thread && msg.from !== thread.userId && msg.from !== thread.supplierId) {
        thread.hasUnread = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Threads
      .addCase(fetchThreads.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchThreads.fulfilled, (state, action) => {
        state.loading = false;
        state.threads = action.payload.map(t => ({
          ...t,
          _id: t._id.toString(),
          hasUnread: t.hasUnread ?? false,
        }));
      })
      .addCase(fetchThreads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })

      // Messages
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesByThread[action.payload.threadId] = action.payload.messages.map(m => ({
          ...m,
          _id: m._id?.toString() ?? "",
          threadId: m.threadId?.toString() ?? "",
          from: m.from?.toString() ?? "",
          to: m.to?.toString() ?? "",
        }));
      })

      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const msg = action.payload;
        if (!state.messagesByThread[msg.threadId]) state.messagesByThread[msg.threadId] = [];
        state.messagesByThread[msg.threadId].push(msg);
      })

      // Mark thread as read
      .addCase(markThreadAsRead.fulfilled, (state, action) => {
        const thread = state.threads.find(t => t._id === action.payload.threadId);
        if (thread) thread.hasUnread = false;
      });
  },
});

export const { clearMessages, addLocalMessage } = chatSlice.actions;
export default chatSlice.reducer;

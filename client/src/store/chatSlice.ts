import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import io, { Socket } from "socket.io-client";
import api from "../services/axios";
import type { Message } from "../types/Message";
import type { Thread } from "../types/Thread";
import type { RootState } from "./index";

// ===========================
// STATE
// ===========================
export interface ChatState {
  threads: Thread[];
  messagesByThread: Record<string, Message[]>;
  loading: boolean;
  error?: string;
  activeThreadId?: string;
}

const initialState: ChatState = {
  threads: [],
  messagesByThread: {},
  loading: false,
};

// ===========================
// SOCKET INIT (GLOBAL CACHE)
// ===========================
let socket: Socket | null = null;

// ===========================
// THUNKS
// ===========================
export const fetchThreads = createAsyncThunk<
  Thread[],
  { userId: string },
  { rejectValue: string }
>("chat/fetchThreads", async ({ userId }, thunkAPI) => {
  try {
    const { data } = await api.get(`/threads/user`);
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const fetchMessages = createAsyncThunk<
  Message[],
  { threadId: string },
  { rejectValue: string }
>("chat/fetchMessages", async ({ threadId }, thunkAPI) => {
  try {
    const { data } = await api.get(`/messages/${threadId}`);
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

// שליחת הודעה דרך REST (ברגע שתרצי — אפשר להפוך ל־socket emit)
export const sendMessage = createAsyncThunk<
  Message,
  { threadId: string; body: string },
  { rejectValue: string; state: RootState }
>("chat/sendMessage", async ({ threadId, body }, thunkAPI) => {
  try {
    const { data } = await api.post(`/messages`, { threadId, body });
    return data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

// ===========================
// SLICE
// ===========================
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // --- SELECT THREAD + SOCKET JOIN ---
    joinThread: (state, action: PayloadAction<{ threadId: string }>) => {
      const threadId = action.payload.threadId;
      state.activeThreadId = threadId;

      if (socket?.connected) {
        socket.emit("join_thread", threadId);
      }
    },

    // --- NEW MESSAGE FROM SOCKET ---
    appendMessage: (state, action: PayloadAction<Message>) => {
      const msg = action.payload;
      const tid = msg.threadId;

      if (!tid) return;

      if (!state.messagesByThread[tid]) {
        state.messagesByThread[tid] = [];
      }
      state.messagesByThread[tid].push(msg);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchThreads.fulfilled, (state, action) => {
        state.threads = action.payload;
      })

      .addCase(fetchMessages.fulfilled, (state, action) => {
        const messages = action.payload;
        if (messages.length > 0) {
          const threadId = messages[0].threadId;
          state.messagesByThread[threadId] = messages;
        }
      })

      .addCase(sendMessage.fulfilled, (state, action) => {
        const msg = action.payload;
        const tid = msg.threadId;

        if (!state.messagesByThread[tid]) {
          state.messagesByThread[tid] = [];
        }
        state.messagesByThread[tid].push(msg);
      });
  },
});

// ===========================
// SOCKET SETUP FUNCTION
// ===========================
export const initChatSocket = (token: string, getState: () => RootState, dispatch: any) => {
  if (socket) return socket;

  socket = io("http://localhost:3000", {
    auth: { token },
    transports: ["websocket"],
  });

  // --- CONNECT ---
  socket.on("connect", () => {
    const active = getState().chat.activeThreadId;
    if (active) socket.emit("join_thread", active);
  });

  socket.on("reconnect", () => {
    const active = getState().chat.activeThreadId;
    if (active) socket.emit("join_thread", active);
  });

  // --- NEW MESSAGE ---
  socket.on("new_message", (msg: Message) => {
    console.log("SOCKET new_message:", msg);
    dispatch(appendMessage(msg));
  });

  (globalThis as any).__chat_socket = socket;

  return socket;
};

// ===========================
export const { joinThread, appendMessage } = chatSlice.actions;
export default chatSlice.reducer;

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../services/axios";
import type { Thread } from "../types/Thread";
import type { Message } from "../types/type";
import { getErrorMessage } from "@/Utils/error";

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

// 1️⃣ Fetch user threads
export const fetchThreads = createAsyncThunk<
  Thread[],
  { id: string; role: "user" | "supplier" },
  { rejectValue: string }
>(
  "chat/fetchThreads",
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const url =
        role === "supplier"
          ? `/threads/supplier/${id}`
          : `/threads/user/${id}`;

      const res = await api.get(url);

      return res.data?.data ?? res.data;
    }  catch (err: unknown) {
        return rejectWithValue(getErrorMessage(err,'שגיאה בטעינת משתמשים'));
      }
  }
);


// 2️⃣ Fetch messages for a thread
export const fetchMessages = createAsyncThunk<
  { threadId: string; messages: Message[] },
  { threadId: string },
  { rejectValue: string }
>(
  "chat/fetchMessages",
  async ({ threadId }, { rejectWithValue }) => {
    console.log("[Thunk] fetchMessages called for threadId:", threadId);
    try {
      const res = await api.get(`/messages/${threadId}`);
      console.log("[Thunk] fetchMessages response:", res.data);
      const messages = res.data?.data ?? res.data;
      return { threadId, messages };
    } catch (err: unknown) {
      console.error("[Thunk] fetchMessages error:", err);
      return rejectWithValue(getErrorMessage(err,'שגיאה בטעינת הודעות'))
    }
  }
);

// 3️⃣ Send message
export const sendMessage = createAsyncThunk<
  Message,
  { threadId: string; body: string; from: string; to?: string },
  { rejectValue: string }
>(
  "chat/sendMessage",
  async ({ threadId, body, from, to  }, { rejectWithValue }) => {
    console.log("[Thunk] sendMessage called for threadId:", threadId, "body:", body);
    const data = {threadId,from, to, body};
    try {
      const res = await api.post("/messages", data);
      console.log("[Thunk] sendMessage response:", res.data);
      return res.data?.data ?? res.data;
    } catch (err: unknown) {
      console.error("[Thunk] sendMessage error:", err);
    return rejectWithValue(getErrorMessage(err,'שגיאה בשליחת הודעה'))
  }
    
  }
);

// 4️⃣ Update message
export const updateMessage = createAsyncThunk<
  Message,
  { id: string; data: Partial<Message> },
  { rejectValue: string }
>(
  "chat/updateMessage",
  async ({ id, data }, { rejectWithValue }) => {
    console.log("[Thunk] updateMessage called for id:", id, "data:", data);
    try {
      const res = await api.patch(`/messages/${id}`, data);
      console.log("[Thunk] updateMessage response:", res.data);
      return res.data?.data ?? res.data;
    } catch (err: unknown) {
      console.error("[Thunk] updateMessage error:", err);
      return rejectWithValue(getErrorMessage(err,"שגיאה בעדכון הודעה"));
    }
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
      const threadId = action.payload;
      console.log("[Reducer] clearMessages for threadId:", threadId);
      delete state.messagesByThread[threadId];
    },

    addLocalMessage: (state, action: PayloadAction<Message>) => {
      const msg = action.payload;
      console.log("[Reducer] addLocalMessage:", msg);
      if (!state.messagesByThread[msg.threadId]) {
        state.messagesByThread[msg.threadId] = [];
      }
      state.messagesByThread[msg.threadId].push(msg);
    },
  },

  extraReducers: (builder) => {
    builder
      // Threads
      .addCase(fetchThreads.pending, (state) => {
        console.log("[ExtraReducer] fetchThreads pending");
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchThreads.fulfilled, (state, action) => {
        console.log("[ExtraReducer] fetchThreads fulfilled:", action.payload);
        state.loading = false;
        state.threads = action.payload;
      })
      .addCase(fetchThreads.rejected, (state, action) => {
        console.error("[ExtraReducer] fetchThreads rejected:", action.payload);
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })

      // Messages
      .addCase(fetchMessages.fulfilled, (state, action) => {
        console.log("[ExtraReducer] fetchMessages fulfilled for threadId:", action.payload.threadId , action.payload);
        state.messagesByThread[action.payload.threadId] = action.payload.messages;
        console.log("addCase in the reducer ", state.messagesByThread);
        
      })

      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        console.log("[ExtraReducer] sendMessage fulfilled:", action.payload);
        const msg = action.payload;
        if (!state.messagesByThread[msg.threadId]) {
          state.messagesByThread[msg.threadId] = [];
        }
        state.messagesByThread[msg.threadId].push(msg);
      })

      // Update message
      .addCase(updateMessage.fulfilled, (state, action) => {
        console.log("[ExtraReducer] updateMessage fulfilled:", action.payload);
        const msg = action.payload;
        const list = state.messagesByThread[msg.threadId];
        if (!list) return;

        const idx = list.findIndex(m => m._id === msg._id);
        if (idx !== -1) list[idx] = msg;
      });
  },
});

export const { clearMessages, addLocalMessage } = chatSlice.actions;
export default chatSlice.reducer;

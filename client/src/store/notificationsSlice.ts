import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { Notification } from "./../types/Notification";
import api from "../services/axios";

interface NotificationsState {
  notifications: Notification[];
  socket?: Socket;
  loading: boolean;
  error: string;
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  error: "",
  socket: undefined,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async () => {
    const res = await api.get<Notification[]>("/notifications");
    console.log('notifi',res);
    
    return res.data;
  }
);
export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId: string) => {
    const res = await api.post(`/notifications/markAsRead`, {
      notificationId, // 👈 זה נשלח בתוך body
    });
    console.log(res);

    return notificationId; // נניח שהשרת מחזיר את ההודעה המעודכנת
  }
);

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setSocket(state, action: PayloadAction<Socket>) {
      state.socket = action.payload;
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch notifications";
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.notifications = Array.isArray(action.payload)
          ? action.payload
          : Object.values(action.payload);
      })
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to mark notification as read";
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.notifications = state.notifications.filter(
          (n) => n.id !== action.payload
        );
      });
  },
});

export const { setSocket, addNotification } = notificationsSlice.actions;

export default notificationsSlice.reducer;

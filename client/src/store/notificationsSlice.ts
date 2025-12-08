import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Notification } from "../types/Notification";
import api from "../services/axios";
import { getErrorMessage } from "@/Utils/error";

interface NotificationsState {
  notifications: Notification[];
  socket?: unknown;
  loading: boolean;
  error: string;
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  error: "",
  socket: undefined,
};

// 🔹 טעינת התראות
export const fetchNotifications = createAsyncThunk<
  Notification[] | Record<string, Notification>,
  void,
  { rejectValue: string }
>("notifications/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/notifications");
    console.log('not',res);
    
    return res.data; // יכול להיות מערך או אובייקט
  } catch (err: unknown) {
    return rejectWithValue(
      getErrorMessage(err, "שגיאה בטעינת ההתראות")
    );
  }
});

// 🔹 סימון התראה כנקראה
export const markNotificationAsRead = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("notifications/markAsRead", async (notificationId, { rejectWithValue }) => {
  try {
    await api.post(`/notifications/markAsRead`, {
      notificationId,
    });
    return notificationId;
  } catch (err: unknown) {
    return rejectWithValue(
      getErrorMessage(err, "שגיאה בסימון התראה כנקראה")
    );
  }
});

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setSocket(state, action: PayloadAction<unknown>) {
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
      .addCase(
        fetchNotifications.fulfilled,
        (
          state,
          action: PayloadAction<Notification[] | Record<string, Notification>>
        ) => {
          state.loading = false;
          state.error = "";

          const payload = action.payload;
          state.notifications = Array.isArray(payload)
            ? payload
            : Object.values(payload ?? {});
        }
      )
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error.message ||
          "Failed to fetch notifications";
      })

      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.notifications = state.notifications.filter(
          (n) => n.id !== action.payload
        );
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error.message ||
          "Failed to mark notification as read";
      });
  },
});

export const { setSocket, addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Socket } from 'socket.io-client';

import type { Notification } from './../types/type';
import api from '../types/api/axiosInstance';

interface NotificationsState {
  notifications: Notification[];
  socket?: Socket;
}

const initialState: NotificationsState = {
  notifications: [],
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async () => {
    const res = await api.get<Notification[]>('/notifications');
    console.log(res);
    
    return res.data ;

  }
);
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
   const res = await api.post(`/notifications/markAsRead`, {
      notificationId, // 👈 זה נשלח בתוך body
    });
    console.log(res);
    
    return notificationId; // נניח שהשרת מחזיר את ההודעה המעודכנת
  }
);

// export const notificationsSlice = createSlice({
//   name: 'notifications',
//   initialState,
//   reducers: {
//     setSocket(state, action: PayloadAction<Socket>) {
//       state.socket = action.payload;
//     },
//     addNotification(state, action: PayloadAction<Notification>) {
//       state.notifications.unshift(action.payload);
//     },
//     // markAsRead(state, action: PayloadAction<string>) {
//     //   state.notifications = state.notifications.map((n) =>
//     //     n._id === action.payload ? { ...n, readAt: new Date() } : n
//     //   );
//     // },
//   },
//   extraReducers: (builder) => {
//     builder.addCase(fetchNotifications.fulfilled, (state, action) => {
//       state.notifications = action.payload;
//     }),
//     builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
//       state.notifications = state.notifications.filter(
//         n => n._id !== action.payload
//       );
//     })
    
//     }
    
// });
export const notificationsSlice = createSlice({
  name: 'notifications',
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
    // builder.addCase(fetchNotifications.fulfilled, (state, action) => {
    //   state.notifications = action.payload;
    // });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
  state.notifications = Array.isArray(action.payload)
    ? action.payload
    : Object.values(action.payload);
});

    builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
      state.notifications = state.notifications.filter(
        n => n.id !== action.payload
      );
    });
  },
});

export const { setSocket, addNotification } = notificationsSlice.actions;

export default notificationsSlice.reducer;

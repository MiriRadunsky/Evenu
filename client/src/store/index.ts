// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer from './dashboardSlice'
import notificationsReducer from './notificationsSlice'

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    notifications: notificationsReducer,
  },
})

// טיפוסי store לשימוש ב־TypeScript
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

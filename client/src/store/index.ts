import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer from './dashboardSlice'
import notificationsReducer from './notificationsSlice'
import suppliersReducer from './suppliersSlice'
import authReducer from './authSlice'
import eventsReducer from './eventsSlice'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    notifications: notificationsReducer,
    suppliers: suppliersReducer,
    events: eventsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

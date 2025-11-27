import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer from './dashboardSlice'
import notificationsReducer from './notificationsSlice'
import suppliersReducer from './suppliersSlice'
import authReducer from './authSlice'
import eventsReducer from './eventsSlice'
import chatReducer from './chatSlice'
import requestReducer from './requestSlice'
import contractsReducer  from './contractsSlice'
import paymentsReducer from './paymentsSlice'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    notifications: notificationsReducer,
    suppliers: suppliersReducer,
    events: eventsReducer,
    chat: chatReducer,
    requests: requestReducer,
    contracts:contractsReducer,
    payments: paymentsReducer

  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

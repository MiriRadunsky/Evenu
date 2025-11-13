import {
  createSlice,
  createAsyncThunk,
  type ActionReducerMapBuilder,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import type { DashboardState, Message, Payment , Request, Event} from "../types/type";
import api from "../api/axios";

const initialState: DashboardState = {
  events: [],
  requests: [],
  payments: [],
  messages: [],
  loading: false,
};

export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchData",
  async (userEmail: string) => {
    
    const [events, requests, payments, messages] = await Promise.all([
      api.get(`/events`),
      axios.get<Request[]>(`/api/requests?email=${userEmail}`),
      axios.get<Payment[]>(`/api/payments`),
      axios.get<Message[]>(`/api/messages`),
    ]);
    return {
      events: events.data.events,
      requests: requests.data,
      payments: payments.data,
      messages: messages.data,
    };
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<DashboardState>) => {
    builder
      .addCase(fetchDashboardData.pending, (state: DashboardState) => {
        state.loading = true;
      })
      .addCase(
        fetchDashboardData.fulfilled,
        (
          state,
          action: PayloadAction<{
            events: Event[];
            requests: Request[];
            payments: Payment[];
            messages: Message[];
          }>
        ) => {
          state.events = action.payload.events;
          state.requests = action.payload.requests;
          state.payments = action.payload.payments;
          state.messages = action.payload.messages;
          state.loading = false;
        }
      )

      .addCase(fetchDashboardData.rejected, (state: DashboardState) => {
        state.loading = false;
      });
  },
});

export default dashboardSlice.reducer;

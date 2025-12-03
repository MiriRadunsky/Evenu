import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Event } from "../types/type";
import api from '../services/axios';

export interface EventState {
  eventsList: Event[];
  selectedEvent: Event | null;
  loadingList: boolean;
  loadingOne: boolean;
  error?: string;
  types?: string[];
}

const initialState: EventState = {
  eventsList: [],
  selectedEvent: null,
  loadingList: false,
  loadingOne: false,
  error: undefined,
  types: [],
};

export type EventType = string;

// --- Thunks ---
export const fetchEvents = createAsyncThunk<Event[], void, { rejectValue: string }>(
  "events/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ success: boolean; events: Event[] }>("/events");
      return data.events;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network Error");
    }
  }
);

export const fetchEventTypes = createAsyncThunk<EventType[], void, { rejectValue: string }>(
  "events/fetchTypes",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ success: boolean; data: EventType[] }>("/events/types");
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Network Error");
    }
  }
);

export const createEvent = createAsyncThunk<Event, Event, { rejectValue: string }>(
  "events/create",
  async (event, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ success: boolean; data: Event }>("/events", event);
      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Error creating event");
    }
  }
);

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearSelectedEvent: (state) => {
      state.selectedEvent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all events
      .addCase(fetchEvents.pending, (state) => {
        state.loadingList = true;
        state.error = undefined;
      })
      .addCase(fetchEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
        state.loadingList = false;
        state.eventsList = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loadingList = false;
        state.error = action.payload || "Network Error";
      })

      // Fetch event types (לא משפיע על loadingList)
      .addCase(fetchEventTypes.pending, (state) => {
        state.error = undefined;
      })
      .addCase(fetchEventTypes.fulfilled, (state, action: PayloadAction<EventType[]>) => {
        state.types = action.payload;
      })
      .addCase(fetchEventTypes.rejected, (state, action) => {
        state.error = action.payload || "Network Error";
      })

      // Create event
      .addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.eventsList.push(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.error = action.payload || "Error creating event";
      });
  },
});

export const { clearSelectedEvent } = eventsSlice.actions;

export default eventsSlice.reducer;

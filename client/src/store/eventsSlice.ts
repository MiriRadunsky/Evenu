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

type EventsResponse = {
  success: boolean;
  events: Event[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

export type EventType = string;

// --- Thunks ---
// Get all events
export const fetchEvents = createAsyncThunk<Event[], void>(
  "events/fetchAll",
  async () => {
    const { data } = await api.get<EventsResponse>("/events");
    console.log("events", data);
    return data.events;
  }
);

export const fetchEventTypes = createAsyncThunk<EventType[], void>(
  "events/fetchTypes",
  async () => {
    const { data } = await api.get<{ success: boolean; data: EventType[] }>("/events/types");
    return data.data; // כאן אנחנו שולפים את המערך מתוך data
  }
);



// Get single event by ID
export const fetchEventById = createAsyncThunk<Event, string>(
  "events/fetchById",
  async (id) => {
    const { data } = await api.get<{ event: Event }>(`/events/${id}`);
    return data.event;
  }
);

// Create event
export const createEvent = createAsyncThunk<Event, Event>(
  "events/create",
  async (event) => {
    const { data } = await api.post<{ success: boolean; data: Event }>("/events", event);
    console.log("data", data);
    return data.data;
  }
);

// Update event
// export const updateEvent = createAsyncThunk<Event, { id: string; data: Partial<Event> }>(
//   "events/update",
//   async ({ id, data }) => {
//         console.log("UPDATE THUNK STARTED", id, data);  // 👈 בדיקה

//     const { data: response } = await api.patch<{ event: Event }>(`/events/${id}`, data);
//     return response.event;
//   }
// );

export const updateEvent = createAsyncThunk<
  Event,
  { id: string; data: Partial<Event> },
  { rejectValue: string }
>(
  "events/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/events/${id}`, data);

      console.log("🔍 SERVER RAW RESPONSE:", res.data); 


      return res.data.data; // ← אולי צריך לשנות
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Error updating");
    }
  }
);




// Delete event
export const deleteEvent = createAsyncThunk<string, string>(
  "events/delete",
  async (id) => {
    await api.delete(`/events/${id}`);
    return id;
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
      // Fetch all
      .addCase(fetchEvents.pending, (state) => { state.loadingList = true; })
      .addCase(fetchEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
        state.loadingList = false;
        state.eventsList = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loadingList = false;
        state.error = action.error.message;
      })

      // Fetch one
      .addCase(fetchEventById.pending, (state) => { state.loadingOne = true; })
      .addCase(fetchEventById.fulfilled, (state, action: PayloadAction<Event>) => {
        state.loadingOne = false;
        state.selectedEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loadingOne = false;
        state.error = action.error.message;
      })
      .addCase(fetchEventTypes.pending, (state) => {
        state.loadingList = true;
      })
      .addCase(fetchEventTypes.fulfilled, (state, action: PayloadAction<EventType[]>) => {
        state.loadingList = false;
        state.types = action.payload;
      })
      .addCase(fetchEventTypes.rejected, (state, action) => {
        state.loadingList = false;
        state.error = action.error.message;
      })
      // Create
      .addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.eventsList.push(action.payload);
      })

      // Update
      .addCase(updateEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        console.log("UPDATE FULFILLED PAYLOAD:", action.payload);
        const idx = state.eventsList.findIndex(e => e._id === action.payload._id);
        if (idx !== -1) state.eventsList[idx] = action.payload;
        if (state.selectedEvent?._id === action.payload._id) state.selectedEvent = action.payload;
      })

      // Delete
      .addCase(deleteEvent.fulfilled, (state, action: PayloadAction<string>) => {
        state.eventsList = state.eventsList.filter(e => e._id !== action.payload);
        if (state.selectedEvent?._id === action.payload) state.selectedEvent = null;
      });
  }
});

export const { clearSelectedEvent } = eventsSlice.actions;

export default eventsSlice.reducer;

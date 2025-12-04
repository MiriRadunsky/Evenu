
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Event } from '../types/type';
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
// 🔹 כל האירועים (בלי פגינציה)
export const fetchEvents = createAsyncThunk<Event[], void>(
  'events/fetchAll',
  async () => {
    const { data } = await api.get<{ success: boolean; data: Event[] }>('/events');
    console.log('event',data);
    
    return data.data;
  }
);

// 🔹 רק אירועים רלוונטיים
export const fetchRelevantEvents = createAsyncThunk<Event[], void>(
  'events/fetchRelevant',
  async () => {
    const { data } = await api.get<{ success: boolean; data: Event[] }>(
      '/events/relevant'
    );
    return data.data;
  }
);

// 🔹 סוגי אירועים
export const fetchEventTypes = createAsyncThunk<EventType[], void>(
  'events/fetchTypes',
  async () => {
    const { data } = await api.get<{ success: boolean; data: EventType[] }>(
      '/events/types'
    );
    return data.data;
  }
);

// 🔹 אירוע בודד לפי ID
export const fetchEventById = createAsyncThunk<Event, string>(
  'events/fetchById',
  async (id) => {
    const { data } = await api.get<{ success: boolean; data: Event }>(`/events/${id}`);
    return data.data;
  }
);

// 🔹 יצירת אירוע
export const createEvent = createAsyncThunk<Event, Event>(
  'events/create',
  async (event) => {
    const { data } = await api.post<{ success: boolean; data: Event }>(
      '/events',
      event
    );
    console.log('data', data);
    return data.data;
  }
);

// 🔹 עדכון אירוע
export const updateEvent = createAsyncThunk<
  Event,
  { id: string; data: Partial<Event> },
  { rejectValue: string }
>('events/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.patch<{ success: boolean; data: Event }>(
      `/events/${id}`,
      data
    );

    console.log('🔍 SERVER RAW RESPONSE:', res.data);

    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Error updating');
  }
});

// 🔹 מחיקת אירוע
export const deleteEvent = createAsyncThunk<string, string>(
  'events/delete',
  async (id) => {
    await api.delete(`/events/${id}`);
    return id;
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearSelectedEvent: (state) => {
      state.selectedEvent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- כל האירועים ----
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

      // ---- רלוונטיים ----
      .addCase(fetchRelevantEvents.pending, (state) => {
        state.loadingList = true;
        state.error = undefined;
      })
      .addCase(
        fetchRelevantEvents.fulfilled,
        (state, action: PayloadAction<Event[]>) => {
          state.loadingList = false;
          state.eventsList = action.payload;
        }
      )
      .addCase(fetchRelevantEvents.rejected, (state, action) => {
        state.loadingList = false;
        state.error = action.error.message;
      })

      // ---- אחד ----
      .addCase(fetchEventById.pending, (state) => {
        state.loadingOne = true;
        state.error = undefined;
      })
      .addCase(fetchEventById.fulfilled, (state, action: PayloadAction<Event>) => {
        state.loadingOne = false;
        state.selectedEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loadingOne = false;
        state.error = action.error.message;
      })

      // ---- סוגי אירועים ----
      // Fetch event types (לא משפיע על loadingList)
      .addCase(fetchEventTypes.pending, (state) => {
        state.error = undefined;
      })
      .addCase(
        fetchEventTypes.fulfilled,
        (state, action: PayloadAction<EventType[]>) => {
          state.loadingList = false;
          state.types = action.payload;
        }
      )
    
      .addCase(fetchEventTypes.rejected, (state, action) => {
        state.error = action.payload || "Network Error";
      })

      // ---- יצירה ----
      .addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.eventsList.push(action.payload);
      })

      // ---- עדכון ----
      .addCase(updateEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        console.log('UPDATE FULFILLED PAYLOAD:', action.payload);
        const idx = state.eventsList.findIndex(
          (e) => e._id === action.payload._id
        );
        if (idx !== -1) state.eventsList[idx] = action.payload;
        if (state.selectedEvent?._id === action.payload._id) {
          state.selectedEvent = action.payload;
        }
      })

      // ---- מחיקה ----
      .addCase(deleteEvent.fulfilled, (state, action: PayloadAction<string>) => {
        state.eventsList = state.eventsList.filter(
          (e) => e._id !== action.payload
        );
        if (state.selectedEvent?._id === action.payload) {
          state.selectedEvent = null;
        }
        })
     
        
      .addCase(createEvent.rejected, (state, action) => {
        state.error = action.payload || "Error creating event";
      });
  },
});

export const { clearSelectedEvent } = eventsSlice.actions;
export default eventsSlice.reducer;

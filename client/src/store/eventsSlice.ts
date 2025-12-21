import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Event } from "../types/Event";
import api from "../services/axios";
import { getErrorMessage } from "@/Utils/error";

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

// 🔹 כל האירועים
// Change fetchEvents to accept { page, pageSize }
export const fetchEvents = createAsyncThunk<
  Event[],
  { page: number; pageSize: number },
  { rejectValue: string }
>("events/fetchAll", async ({ page, pageSize }, { rejectWithValue }) => {
  try {
    const { data } = await api.get<{ success: boolean; data: Event[] }>(
      `/events?page=${page}&pageSize=${pageSize}`
    );
    return data.data; // Removed status filtering
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, "שגיאה בטעינת אירועים"));
  }
});

// 🔹 אירועים רלוונטיים
export const fetchRelevantEvents = createAsyncThunk<
  Event[],
  void,
  { rejectValue: string }
>("events/fetchRelevant", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<{ success: boolean; data: Event[] }>(
      "/events/relevant"
    );
    return data.data;
  } catch (err: unknown) {
    return rejectWithValue(
      getErrorMessage(err, "שגיאה בטעינת אירועים רלוונטיים")
    );
  }
});

// 🔹 סוגי אירועים
export const fetchEventTypes = createAsyncThunk<
  EventType[],
  void,
  { rejectValue: string }
>("events/fetchTypes", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<{ success: boolean; data: EventType[] }>(
      "/events/types"
    );
    return data.data;
  } catch (err: unknown) {
    return rejectWithValue(
      getErrorMessage(err, "שגיאה בטעינת סוגי אירועים")
    );
  }
});

// 🔹 אירוע בודד לפי ID
export const fetchEventById = createAsyncThunk<
  Event,
  string,
  { rejectValue: string }
>("events/fetchById", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get<{ success: boolean; data: Event }>(
      `/events/${id}`
    );
    return data.data;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, "שגיאה בטעינת אירוע"));
  }
});

// 🔹 יצירת אירוע
export const createEvent = createAsyncThunk<
  Event,
  Partial<Event>,
  { rejectValue: string }
>("events/create", async (event, { rejectWithValue }) => {
  try {
    const { data } = await api.post<{ success: boolean; data: Event }>(
      "/events",
      event
    );
    console.log("data", data);
    return data.data;
  } catch (err: unknown) {
    console.log("err", err);
    return rejectWithValue(getErrorMessage(err, "שגיאה ביצירת אירוע"));
  }
});

// 🔹 עדכון אירוע
export const updateEvent = createAsyncThunk<
  Event,
  { id: string; data: Partial<Event> },
  { rejectValue: string }
>("events/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.patch<{ success: boolean; data: Event }>(
      `/events/${id}`,
      data
    );
    return res.data.data;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, "שגיאה בעדכון אירוע"));
  }
});
 
// 🔹 מחיקת אירוע
export const deleteEvent = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("events/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/events/${id}`);
    return id;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, "שגיאה במחיקת אירוע"));
  }
});

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
      // ---- כל האירועים ----
      .addCase(fetchEvents.pending, (state) => {
        state.loadingList = true;
        state.error = undefined;
      })
      .addCase(
        fetchEvents.fulfilled,
        (state, action: PayloadAction<Event[]>) => {
          state.loadingList = false;
          state.eventsList = action.payload;
        }
      )
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loadingList = false;
        state.error =
          action.payload
      })

      // ---- אירועים רלוונטיים ----
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
        state.error =
          action.payload ;
      })

      // ---- אירוע בודד ----
      .addCase(fetchEventById.pending, (state) => {
        state.loadingOne = true;
        state.error = undefined;
      })
      .addCase(
        fetchEventById.fulfilled,
        (state, action: PayloadAction<Event>) => {
          state.loadingOne = false;
          state.selectedEvent = action.payload;
        }
      )
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loadingOne = false;
        state.error =
          action.payload 
      })

      // ---- סוגי אירועים ----
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
        state.error =
          action.payload || action.error.message || "Network Error";
      })

      // ---- יצירת אירוע ----
      .addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.eventsList.push(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.error =
          action.payload ;
      })

      // ---- עדכון אירוע ----
      .addCase(updateEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        console.log("UPDATE FULFILLED PAYLOAD:", action.payload);
        const idx = state.eventsList.findIndex(
          (e) => e._id === action.payload._id
        );
        if (idx !== -1) state.eventsList[idx] = action.payload;
        if (state.selectedEvent?._id === action.payload._id) {
          state.selectedEvent = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.error =
          action.payload || action.error.message || "שגיאה בעדכון אירוע";
      })

      // ---- מחיקת אירוע ----
      .addCase(
        deleteEvent.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.eventsList = state.eventsList.filter(
            (e) => e._id !== action.payload
          );
          if (state.selectedEvent?._id === action.payload) {
            state.selectedEvent = null;
          }
        }
      )
      .addCase(deleteEvent.rejected, (state, action) => {
        state.error =
          action.payload || action.error.message || "שגיאה במחיקת אירוע";
      });
  },
});

export const { clearSelectedEvent } = eventsSlice.actions;
export default eventsSlice.reducer;

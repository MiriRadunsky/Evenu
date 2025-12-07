import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/axios";
import { getErrorMessage } from "@/Utils/error";
export interface BudgetHistoryItem {
  oldValue: number;
  newValue: number;
  changedAt: string;
  changedBy?: {
    _id: string;
    name?: string;
    email?: string;
  } | string;
  reason?: string;
}

export interface EventWithBudget {
  _id: string;
  name: string;
  date: string;
  budget?: number;
  budgetAllocated?: number;
  budgetHistory?: BudgetHistoryItem[];
}


interface BudgetState {
  events: EventWithBudget[];
  loading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  events: [],
  loading: false,
  error: null,
};

export const fetchBudgetEvents = createAsyncThunk<
  EventWithBudget[],
  void,
  { rejectValue: string }
>("budget/fetchEvents", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/budget/events");
    return data.events;
  } catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err, "שגיאה בטעינת נתוני התקציב"));
  }
  
});

export const updateBudget = createAsyncThunk<
  EventWithBudget,
  { eventId: string; newBudget: number; reason?: string },
  { rejectValue: string }
>("budget/updateBudget", async ({ eventId, newBudget, reason }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/budget/events/${eventId}`, {
      newBudget,
      reason,
    });
    return data;
  }
  catch (err: unknown) {
    return rejectWithValue(getErrorMessage(err,"שגיאה בעדכון התקציב"));
  }
});

const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgetEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgetEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchBudgetEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "שגיאה";
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        const idx = state.events.findIndex(
          (e) => e._id === action.payload._id
        );
        if (idx !== -1) {
          state.events[idx] = action.payload;
        }
      });
  },
});

export default budgetSlice.reducer;

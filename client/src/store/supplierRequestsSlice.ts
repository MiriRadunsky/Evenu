import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../services/axios";
import type { Request } from "../types/Request";

export interface RequestState {
  requests: Request[];
  loading: boolean;
  error?: string;
}

const initialState: RequestState = {
  requests: [],
  loading: false,
  error: undefined,
};

// Fetch all requests
export const fetchRequests = createAsyncThunk<Request[], { clientEmail?: string } | void, { rejectValue: string }>(
  "requests/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/requests", { params });
      return Array.isArray(data.requests) ? data.requests : Object.values(data.requests || []);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch requests");
    }
  }
);

// Create supplier request
export const createSupplierRequest = createAsyncThunk<Request, { eventId: string; supplierId: string; notesFromClient: string }, { rejectValue: string }>(
  "requests/create",
  async ({ eventId, supplierId, notesFromClient }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/events/${eventId}/requests`, { supplierId, notesFromClient });
      // data.request + data.threadId
      return { ...data.request, threadId: data.threadId };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to create request");
    }
  }
);

// Approve request
export const approveRequest = createAsyncThunk<Request, string, { rejectValue: string }>(
  "requests/approve",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/requests/approve/${id}`);
      return data.request;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to approve request");
    }
  }
);

// Decline request
export const declineRequest = createAsyncThunk<Request, string, { rejectValue: string }>(
  "requests/decline",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/requests/decline/${id}`);
      return data.request;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to decline request");
    }
  }
);

const requestSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchRequests.pending, (state) => { state.loading = true; })
      .addCase(fetchRequests.fulfilled, (state, action) => { state.loading = false; state.requests = action.payload; })
      .addCase(fetchRequests.rejected, (state, action) => { state.loading = false; state.error = action.payload;   console.log("Fetched requests on redux:", action.payload);
})

      // Create
      .addCase(createSupplierRequest.pending, (state) => { state.loading = true; })
      .addCase(createSupplierRequest.fulfilled, (state, action) => { state.loading = false; state.requests.push(action.payload); })
      .addCase(createSupplierRequest.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Approve
      .addCase(approveRequest.pending, (state) => { state.loading = true; })
      .addCase(approveRequest.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.requests.findIndex(r => r._id === action.payload._id);
        if (idx !== -1) state.requests[idx] = action.payload;
      })
      .addCase(approveRequest.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Decline
      .addCase(declineRequest.pending, (state) => { state.loading = true; })
      .addCase(declineRequest.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.requests.findIndex(r => r._id === action.payload._id);
        if (idx !== -1) state.requests[idx] = action.payload;
      })
      .addCase(declineRequest.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export default requestSlice.reducer;

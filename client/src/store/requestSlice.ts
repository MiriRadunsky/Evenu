import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../services/axios";

export interface SupplierRequest {
  _id: string;
  eventId: string;
  supplierId: string;
  clientId: string;
  notesFromClient: string;
  status: "pending" | "approved" | "declined";
  createdAt: string;
}

export interface RequestState {
  requests: SupplierRequest[];
  loading: boolean;
  error?: string;
}

const initialState: RequestState = {
  requests: [],
  loading: false,
  error: undefined,
};

/* ---------------------------------------------------
   🔹 CREATE client → supplier request
   POST /requests/:eventId
--------------------------------------------------- */
export const createSupplierRequest = createAsyncThunk<
  SupplierRequest,
  { eventId: string; supplierId: string; notesFromClient: string },
  { rejectValue: string }
>("requests/create", async ({ eventId, supplierId, notesFromClient }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/requests/${eventId}`, {
      supplierId,
      notesFromClient,
    });

    return data.request;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to create request");
  }
});

/* ---------------------------------------------------
   🔹 APPROVE request
   PATCH /requests/approve/:id
--------------------------------------------------- */
export const approveRequest = createAsyncThunk<
  SupplierRequest,
  string,
  { rejectValue: string }
>("requests/approve", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/requests/approve/${id}`);
    return data.request;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to approve request");
  }
});

/* ---------------------------------------------------
   🔹 DECLINE request
   PATCH /requests/decline/:id
--------------------------------------------------- */
export const declineRequest = createAsyncThunk<
  SupplierRequest,
  string,
  { rejectValue: string }
>("requests/decline", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/requests/decline/${id}`);
    return data.request;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to decline request");
  }
});

const requestSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createSupplierRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSupplierRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.push(action.payload);
      })
      .addCase(createSupplierRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Approve
      .addCase(approveRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(approveRequest.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.requests.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) state.requests[idx] = action.payload;
      })
      .addCase(approveRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Decline
      .addCase(declineRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(declineRequest.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.requests.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) state.requests[idx] = action.payload;
      })
      .addCase(declineRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default requestSlice.reducer;

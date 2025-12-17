import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/axios";
import type { Request } from "../types/Request";
import { getErrorMessage } from "@/Utils/error";

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

// 🔹 Fetch all requests
export const fetchRequests = createAsyncThunk<
  Request[],
  { clientEmail?: string } | void,
  { rejectValue: string }
>("requests/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/requests", { params });
    const requests = Array.isArray(data.requests)
      ? data.requests
      : Object.values(data.requests || {});
    return requests as Request[];
  } catch (err: unknown) {
    return rejectWithValue(
      getErrorMessage(err, "Failed to fetch requests")
    );
  }
});

// 🔹 Create supplier request
export const createSupplierRequest = createAsyncThunk<
  Request,
  { eventId: string; supplierId: string; notesFromClient: string },
  { rejectValue: string }
>(
  "requests/create",
  async ({ eventId, supplierId, notesFromClient }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/events/${eventId}/requests`, {
        supplierId,
        notesFromClient,
      });
      // data.request + data.threadId
      console.log("successful request creation response:", data);
      
      return { ...data.request, threadId: data.threadId } as Request;
    } catch (err: unknown) {
      console.log("un error for request creation:", err);
      return rejectWithValue(
        getErrorMessage(err, "Failed to create request")
      );
    }
  }
);

// 🔹 Approve request
export const approveRequest = createAsyncThunk<
  Request,
  string,
  { rejectValue: string }
>("requests/approve", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/requests/approve/${id}`);
    return data.request as Request;
  } catch (err: unknown) {
    return rejectWithValue(
      getErrorMessage(err, "Failed to approve request")
    );
  }
});

// 🔹 Decline request
export const declineRequest = createAsyncThunk<
  Request,
  string,
  { rejectValue: string }
>("requests/decline", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/requests/decline/${id}`);
    return data.request as Request;
  } catch (err: unknown) {
    return rejectWithValue(
      getErrorMessage(err, "שגיאה בדחיית הבקשה")
    );
  }
});

const requestSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ---- Fetch ----
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error.message ||
          "Failed to fetch requests";
        console.log("Fetched requests error:", state.error);
      })

      // ---- Create ----
      .addCase(createSupplierRequest.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(createSupplierRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.push(action.payload);
      })
      .addCase(createSupplierRequest.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error.message ||
          "Failed to create request";
      })

      // ---- Approve ----
      .addCase(approveRequest.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(approveRequest.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.requests.findIndex(
          (r) => r._id === action.payload._id
        );
        if (idx !== -1) state.requests[idx] = action.payload;
      })
      .addCase(approveRequest.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error.message ||
          "Failed to approve request";
      })

      // ---- Decline ----
      .addCase(declineRequest.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(declineRequest.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.requests.findIndex(
          (r) => r._id === action.payload._id
        );
        if (idx !== -1) state.requests[idx] = action.payload;
      })
      .addCase(declineRequest.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error.message ||
          "Failed to decline request";
      });
  },
});

export default requestSlice.reducer;

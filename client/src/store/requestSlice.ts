
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../services/axios";
import type { Request } from "../types/Request";
import { getErrorMessage } from "@/Utils/error";


export interface RequestPagination {
  items: Request[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RequestState {
  data: RequestPagination | null;
  selectedSupplierRequest: Request | null;
  loading: boolean;
  error: string | null;
}

const initialState: RequestState = {
  data: null,
  selectedSupplierRequest: null,
  loading: false,
  error: null,
};

export const fetchRequests = createAsyncThunk<
  RequestPagination,
  { page?: number; limit?: number; status?: string; eventId?: string } | void,
  { rejectValue: string }
>("requests/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const query = params ?? {};
    const { data } = await api.get("/requests", { params: query });
    console.log('user',data);
    
    return data as RequestPagination;
  } catch (error: unknown) {
    return rejectWithValue(
      getErrorMessage(error, "שגיאה בטעינת בקשות")
    );
  }
});

export const fetchRequestsBySupplier = createAsyncThunk<
RequestPagination,
{ page?: number; limit?: number; status?: string } | void,
{ rejectValue: string }
>(
  "requests/fetchRequestsBySupplier",
  async (params, { rejectWithValue }) => {
    try {
      const query = params ?? {};
      const { data } = await api.get("/requests/supplier", { params: query });
      console.log('supplier',data);
      return data as RequestPagination;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "שגיאה בטעינת בקשות")
      );
    }
  }
);

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
      return data.request as Request;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "שגיאה ביצירת בקשה")
      );
    }
  }
);

export const approveRequest = createAsyncThunk<
  Request,
  string,
  { rejectValue: string }
>("requests/approve", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/requests/${id}/approve`);
    return data.request as Request;
  } catch (error: unknown) {
    return rejectWithValue(
      getErrorMessage(error, "שגיאה באישור בקשה")
    );
  }
});


export const declineRequest = createAsyncThunk<
  Request,
  string,
  { rejectValue: string }
>("requests/decline", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/requests/${id}/decline`);
    return data.request as Request;
  } catch (error: unknown) {
    return rejectWithValue(
      getErrorMessage(error, "שגיאה בדחיית בקשה")
    );
  }
});


const requestSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    SetSelectedSupplierRequest(state, action: PayloadAction<{ id: string }>) {
      const selected = state.data?.items.find(
        (r) => r._id === action.payload.id
      );
      state.selectedSupplierRequest = selected || null;
    },
    clearSelectedSupplierRequest(state) {
      state.selectedSupplierRequest = null;
    },
  },

  extraReducers: (builder) => {
    /* ---------- FETCH (client) ---------- */
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? action.error.message ?? "Failed to fetch requests";
      });

    /* ---------- FETCH (supplier) ---------- */
    builder
      .addCase(fetchRequestsBySupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequestsBySupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchRequestsBySupplier.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to fetch supplier requests";
      });

    /* ---------- CREATE ---------- */
    builder
      .addCase(createSupplierRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupplierRequest.fulfilled, (state, action) => {
        state.loading = false;
        if (state.data) {
          state.data.items.push(action.payload);
          state.data.total += 1;
          state.data.totalPages = Math.max(
            state.data.totalPages,
            Math.ceil(state.data.total / state.data.pageSize)
          );
        } else {
          state.data = {
            items: [action.payload],
            total: 1,
            page: 1,
            pageSize: 1,
            totalPages: 1,
          };
        }
      })
      .addCase(createSupplierRequest.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to create request";
      });

    /* ---------- APPROVE ---------- */
    builder
      .addCase(approveRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveRequest.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.data) return;
        const idx = state.data.items.findIndex(
          (r) => r._id === action.payload._id
        );
        if (idx !== -1) {
          state.data.items[idx] = action.payload;
        }
      })
      .addCase(approveRequest.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to approve request";
      });

    /* ---------- DECLINE ---------- */
    builder
      .addCase(declineRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(declineRequest.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.data) return;
        const idx = state.data.items.findIndex(
          (r) => r._id === action.payload._id
        );
        if (idx !== -1) {
          state.data.items[idx] = action.payload;
        }
      })
      .addCase(declineRequest.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to decline request";
      });
  },
});

export default requestSlice.reducer;
export const {
  SetSelectedSupplierRequest,
  clearSelectedSupplierRequest,
} = requestSlice.actions;

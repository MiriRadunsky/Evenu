import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../services/axios";
import type { Event } from "../types/type";

// ----- טיפוס תשובה מהשרת -----
export interface DashboardSummaryResponse {
  upcomingEvent: Event[]|null ; 
  pendingRequestsCount: number;
  approvedRequestsCount: number;   
  activeContractsCount: number; 
  pendingPaymentsCount: number;
  pendingPaymentsTotal: number;
  overduePaymentsCount: number;
}

// ----- סטייט ----- 
export interface DashboardSummaryState {
  loading: boolean;
  error: string | null;
  upcomingEvent: Event[]|null ;
  pendingRequestsCount: number;
  approvedRequestsCount: number;  
  activeContractsCount: number;    
  pendingPaymentsCount: number;
  pendingPaymentsTotal: number;
  overduePaymentsCount: number;
}

// ----- initialState -----
const initialState: DashboardSummaryState = {
  loading: false,
  error: null,
  upcomingEvent: null,
  pendingRequestsCount: 0,
  approvedRequestsCount: 0,
  activeContractsCount: 0,
  pendingPaymentsCount: 0,
  pendingPaymentsTotal: 0,
  overduePaymentsCount: 0,
};

// ----- thunk -----
export const fetchDashboardSummaryUser = createAsyncThunk<
  DashboardSummaryResponse
>("dashboard/fetchSummaryUser", async () => {
  const res = await api.get("/dashboard/summaryUser");
  return res.data;
});
export const fetchDashboardSummarySupplier = createAsyncThunk<
  DashboardSummaryResponse
>("dashboard/fetchSummarySupplier", async () => {
  const res = await api.get("/dashboard/summarySupplier");
  return res.data;
});
// ----- slice -----
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummaryUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDashboardSummaryUser.fulfilled,
        (state, action: PayloadAction<DashboardSummaryResponse>) => {
          state.loading = false;
          state.error = null;
          
          state.upcomingEvent = action.payload.upcomingEvent;
          state.pendingRequestsCount = action.payload.pendingRequestsCount;
          state.approvedRequestsCount = action.payload.approvedRequestsCount;   // ✅
          state.activeContractsCount = action.payload.activeContractsCount;     // ✅
          state.pendingPaymentsCount = action.payload.pendingPaymentsCount;
          state.pendingPaymentsTotal = action.payload.pendingPaymentsTotal;
          state.overduePaymentsCount = action.payload.overduePaymentsCount;
        }
      )
      .addCase(fetchDashboardSummaryUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "שגיאה בטעינת נתוני הדשבורד";
      })
      .addCase(fetchDashboardSummarySupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDashboardSummarySupplier.fulfilled,
        (state, action: PayloadAction<DashboardSummaryResponse>) => {
          state.loading = false;
          state.error = null;
          
          state.upcomingEvent = action.payload.upcomingEvent;
          state.pendingRequestsCount = action.payload.pendingRequestsCount;
          state.approvedRequestsCount = action.payload.approvedRequestsCount;   // ✅
          state.activeContractsCount = action.payload.activeContractsCount;     // ✅
          state.pendingPaymentsCount = action.payload.pendingPaymentsCount;
          state.pendingPaymentsTotal = action.payload.pendingPaymentsTotal;
          state.overduePaymentsCount = action.payload.overduePaymentsCount;
        }
      )
      .addCase(fetchDashboardSummarySupplier.rejected, (state, action) => {
        state.loading = false;
        state.error =
        action.error.message || "שגיאה בטעינת נתוני הדשבורד";
      })
  },
});

export default dashboardSlice.reducer;

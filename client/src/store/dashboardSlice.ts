import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../services/axios";
import type { Event } from "../types/Event";
import { getErrorMessage } from "@/Utils/error";
export interface PaymentsByMonth {
  month: string; 
  total: number;
}

export interface PaymentsByStatus {
  status: string; 
  count: number;  
  [key: string]: string | number;

}

export interface DashboardChartsUserResponse {
  paymentsByMonth: PaymentsByMonth[];
  paymentsByStatus: PaymentsByStatus[];
}

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
  upcomingEvent: Event[] | null;
  pendingRequestsCount: number;
  approvedRequestsCount: number;
  activeContractsCount: number;
  pendingPaymentsCount: number;
  pendingPaymentsTotal: number;
  overduePaymentsCount: number;

  // חדשים – גרפים ליוזר
  paymentsByMonth: PaymentsByMonth[];
  paymentsByStatus: PaymentsByStatus[];
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

  paymentsByMonth: [],
  paymentsByStatus: [],
};

export const fetchDashboardChartsUser = createAsyncThunk<
  DashboardChartsUserResponse,
  void
>("dashboard/fetchChartsUser", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/dashboard/user/charts");
    console.log('res',res);
    
    return res.data as DashboardChartsUserResponse;
  } catch (err: unknown) {
    console.error(err);
    return rejectWithValue(
      getErrorMessage(err, "שגיאה בטעינת גרפים לדשבורד המשתמש")
    );
  }
});

// ----- thunk -----
export const fetchDashboardSummaryUser = createAsyncThunk<
  DashboardSummaryResponse
>("dashboard/fetchSummaryUser", async (_, { rejectWithValue }) => {
  try{
  const res = await api.get("/dashboard/summaryUser");  
  return res.data;
  }catch(err:unknown){
    console.error(err);
       return rejectWithValue(getErrorMessage(err,'שגיאה בטעינת פרטי המשתמש'));

  }
});
export const fetchDashboardSummarySupplier = createAsyncThunk<
  DashboardSummaryResponse
>("dashboard/fetchSummarySupplier", async (_, { rejectWithValue }) => {
  try{
  const res = await api.get("/dashboard/summarySupplier");

  return res.data;
  }
  catch(err:unknown){
    console.error(err);
    return rejectWithValue(getErrorMessage(err,'שגיאה בטעינת פרטי הספק'));
  }
});
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
          state.approvedRequestsCount = action.payload.approvedRequestsCount;  
          state.activeContractsCount = action.payload.activeContractsCount;     
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
          state.approvedRequestsCount = action.payload.approvedRequestsCount;  
          state.activeContractsCount = action.payload.activeContractsCount;     
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
        .addCase(fetchDashboardChartsUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDashboardChartsUser.fulfilled,
        (state, action: PayloadAction<DashboardChartsUserResponse>) => {
          state.loading = false;
          state.error = null;
          state.paymentsByMonth = action.payload.paymentsByMonth;
          state.paymentsByStatus = action.payload.paymentsByStatus;
        }
      )
      .addCase(fetchDashboardChartsUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string | undefined) ||
          action.error.message ||
          "שגיאה בטעינת גרפים לדשבורד המשתמש";
      });
  },
});

export default dashboardSlice.reducer;

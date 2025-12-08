import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../services/axios";
import type { Event } from "../types/Event";
import { getErrorMessage } from "@/Utils/error";


export interface RevenueByMonth {
  month: string; 
  total: number; 
}
export interface PaymentsByStatus {
  status: string;
  count: number;
  [key: string]: string | number;
}

export interface SupplierDashboardSummaryResponse {
  upcomingEvent: Event[] | null;
  pendingRequestsCount: number;
  approvedRequestsCount: number;
  activeContractsCount: number;
  pendingPaymentsCount: number;
  pendingPaymentsTotal: number;
  overduePaymentsCount: number;
  monthRevenue: number;
  yearRevenue: number;
}

export interface SupplierDashboardChartsResponse {
  revenueByMonth: RevenueByMonth[];
  paymentsByStatus: PaymentsByStatus[];
}

export interface SupplierDashboardState {
  loading: boolean;
  error: string | null;
  upcomingEvent: Event[] | null;
  pendingRequestsCount: number;
  approvedRequestsCount: number;
  activeContractsCount: number;
  pendingPaymentsCount: number;
  pendingPaymentsTotal: number;
  overduePaymentsCount: number;
  monthRevenue: number;
  yearRevenue: number;
  revenueByMonth: RevenueByMonth[];
  paymentsByStatus: PaymentsByStatus[];
}

const initialState: SupplierDashboardState = {
  loading: false,
  error: null,

  upcomingEvent: null,
  pendingRequestsCount: 0,
  approvedRequestsCount: 0,
  activeContractsCount: 0,
  pendingPaymentsCount: 0,
  pendingPaymentsTotal: 0,
  overduePaymentsCount: 0,
  monthRevenue: 0,
  yearRevenue: 0,
  revenueByMonth: [],
  paymentsByStatus: [],
};


export const fetchDashboardSummarySupplier = createAsyncThunk<
  SupplierDashboardSummaryResponse,
  void
>("supplierDashboard/fetchSummary", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/dashboard/summarySupplier");
    return res.data as SupplierDashboardSummaryResponse;
  } catch (err: unknown) {
    console.error(err);
    return rejectWithValue(getErrorMessage(err, "שגיאה בטעינת פרטי הספק"));
  }
});

export const fetchDashboardChartsSupplier = createAsyncThunk<
  SupplierDashboardChartsResponse,
  void
>("supplierDashboard/fetchCharts", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/dashboard/supplier/charts");
    return res.data as SupplierDashboardChartsResponse;
  } catch (err: unknown) {
    console.error(err);
    return rejectWithValue(
      getErrorMessage(err, "שגיאה בטעינת גרפים לדשבורד הספק")
    );
  }
});


const supplierDashboardSlice = createSlice({
  name: "supplierDashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummarySupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDashboardSummarySupplier.fulfilled,
        (state, action: PayloadAction<SupplierDashboardSummaryResponse>) => {
          state.loading = false;
          state.error = null;

          state.upcomingEvent = action.payload.upcomingEvent;
          state.pendingRequestsCount = action.payload.pendingRequestsCount;
          state.approvedRequestsCount = action.payload.approvedRequestsCount;
          state.activeContractsCount = action.payload.activeContractsCount;
          state.pendingPaymentsCount = action.payload.pendingPaymentsCount;
          state.pendingPaymentsTotal = action.payload.pendingPaymentsTotal;
          state.overduePaymentsCount = action.payload.overduePaymentsCount;

          state.monthRevenue = action.payload.monthRevenue;
          state.yearRevenue = action.payload.yearRevenue;
        }
      )
      .addCase(fetchDashboardSummarySupplier.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string | undefined) ||
          action.error.message ||
          "שגיאה בטעינת נתוני הדשבורד";
      });

    // ----- CHARTS -----
    builder
      .addCase(fetchDashboardChartsSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDashboardChartsSupplier.fulfilled,
        (state, action: PayloadAction<SupplierDashboardChartsResponse>) => {
          state.loading = false;
          state.error = null;

          state.revenueByMonth = action.payload.revenueByMonth;
          state.paymentsByStatus = action.payload.paymentsByStatus;
        }
      )

      .addCase(fetchDashboardChartsSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string | undefined) ||
          action.error.message ||
          "שגיאה בטעינת גרפים לדשבורד";
      });
  },
});

export default supplierDashboardSlice.reducer;

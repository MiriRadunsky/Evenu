import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../services/axios";
import type { Payment } from "../types/Payment";

export interface PaymentsSummary {
  pendingPaymentsCount: number;
  pendingPaymentsTotal: number;
  overduePaymentsCount: number;
  paidPaymentsCount: number;
}

interface PaymentsPageResult {
  items: Payment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: PaymentsSummary | null;
}

interface PaymentsState {
  role: "user" | "supplier" | null;
  data: PaymentsPageResult;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  role: null,
  data: {
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    summary: null,
  },
  loading: false,
  error: null,
};

type FetchPaymentsParams = {
  page?: number;
  limit?: number;
  status?: string;   
  eventId?: string;
};

/* ---------------------------------------------------
   🔹 FETCH payments for client (עם פגינציה + סינון)
   GET /payments/client?page=&limit=&status=&eventId=
--------------------------------------------------- */
export const fetchClientPayments = createAsyncThunk<
  PaymentsPageResult,
  FetchPaymentsParams | void,
  { rejectValue: string }
>("payments/fetchClientPayments", async (params, { rejectWithValue }) => {
  try {
    const query = params ?? {};
    const { data } = await api.get("/payments/client", { params: query });
    // מצופה: { items, total, page, pageSize, totalPages, summary }
    return data as PaymentsPageResult;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || "שגיאה בטעינת התשלומים"
    );
  }
});

/* ---------------------------------------------------
   🔹 FETCH payments for supplier (עם פגינציה + סינון)
   GET /payments/supplier?page=&limit=&status=&eventId=
--------------------------------------------------- */
export const fetchSupplierPayments = createAsyncThunk<
  PaymentsPageResult,
  FetchPaymentsParams | void,
  { rejectValue: string }
>("payments/fetchSupplierPayments", async (params, { rejectWithValue }) => {
  try {
    const query = params ?? {};
    const { data } = await api.get("/payments/supplier", { params: query });
    return data as PaymentsPageResult;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || "שגיאה בטעינת התשלומים"
    );
  }
});

/* ---------------------------------------------------
   🔹 לקוח – מדווח ששילם
   PATCH /payments/:id/report-paid
--------------------------------------------------- */
export const reportPaymentPaid = createAsyncThunk<
  Payment,
  { paymentId: string; method: string; note?: string; documentKey?: string },
  { rejectValue: string }
>(
  "payments/reportPaid",
  async ({ paymentId, method, note, documentKey }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/payments/${paymentId}/report-paid`, {
        method,
        note,
        documentKey,
      });
      return res.data as Payment;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "שגיאה בדיווח על תשלום";
      return rejectWithValue(message);
    }
  }
);

/* ---------------------------------------------------
   🔹 ספק – מאשר תשלום
   PATCH /payments/:id/confirm-paid
--------------------------------------------------- */
export const confirmPaymentPaid = createAsyncThunk<
  Payment,
  { paymentId: string; method?: string; note?: string; documentKey?: string },
  { rejectValue: string }
>(
  "payments/confirmPaid",
  async ({ paymentId, method, note, documentKey }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/payments/${paymentId}/confirm-paid`, {
        method,
        note,
        documentKey,
      });
      return res.data as Payment;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "שגיאה באישור התשלום";
      return rejectWithValue(message);
    }
  }
);

/* ---------------------------------------------------
   🔹 ספק – דוחה תשלום
   PATCH /payments/:id/reject-paid
--------------------------------------------------- */
export const rejectPayment = createAsyncThunk<
  Payment,
  { paymentId: string; reason: string },
  { rejectValue: string }
>("payments/reject", async ({ paymentId, reason }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/payments/${paymentId}/reject-paid`, {
      reason,
    });
    return res.data as Payment;
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "שגיאה בדחיית התשלום";
    return rejectWithValue(message);
  }
});

// חישוב summary מקומי (על העמוד הנוכחי בלבד) – אם תרצי לעדכן אחרי פעולה
function recalcSummary(state: PaymentsState) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let pendingPaymentsCount = 0;
  let pendingPaymentsTotal = 0;
  let overduePaymentsCount = 0;
  let paidPaymentsCount = 0;

  for (const p of state.data.items) {
    if (p.status === "שולם") {
      paidPaymentsCount++;
      continue;
    }

    if (p.status === "ממתין") {
      pendingPaymentsCount++;
      pendingPaymentsTotal += p.amount || 0;

      if (p.dueDate) {
        const due = new Date(p.dueDate);
        if (due < now) overduePaymentsCount++;
      }
    }
  }

  state.data.summary = {
    pendingPaymentsCount,
    pendingPaymentsTotal,
    overduePaymentsCount,
    paidPaymentsCount,
  };
}

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    resetPaymentsState: () => initialState,
  },
  extraReducers: (builder) => {
    const updatePaymentInState = (state: PaymentsState, updated: Payment) => {
      const idx = state.data.items.findIndex(
        (p) => String(p._id) === String(updated._id)
      );
      if (idx !== -1) {
        state.data.items[idx] = updated;
      } else {
        state.data.items.unshift(updated);
        state.data.total += 1;
      }
      recalcSummary(state);
    };

    /* -------- client fetch -------- */
    builder
      .addCase(fetchClientPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchClientPayments.fulfilled,
        (state, action: PayloadAction<PaymentsPageResult>) => {
          state.loading = false;
          state.role = "user";
          state.data = action.payload;
        }
      )
      .addCase(fetchClientPayments.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "שגיאה בטעינת התשלומים";
      });

    /* -------- supplier fetch -------- */
    builder
      .addCase(fetchSupplierPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSupplierPayments.fulfilled,
        (state, action: PayloadAction<PaymentsPageResult>) => {
          state.loading = false;
          state.role = "supplier";
          state.data = action.payload;
        }
      )
      .addCase(fetchSupplierPayments.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "שגיאה בטעינת התשלומים";
      });

    /* -------- reportPaid -------- */
    builder
      .addCase(reportPaymentPaid.fulfilled, (state, action) => {
        updatePaymentInState(state, action.payload);
      })
      .addCase(reportPaymentPaid.rejected, (state, action) => {
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "שגיאה בדיווח על תשלום";
      });

    /* -------- confirmPaid -------- */
    builder
      .addCase(confirmPaymentPaid.fulfilled, (state, action) => {
        updatePaymentInState(state, action.payload);
      })
      .addCase(confirmPaymentPaid.rejected, (state, action) => {
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "שגיאה באישור התשלום";
      });

    /* -------- rejectPayment -------- */
    builder
      .addCase(rejectPayment.fulfilled, (state, action) => {
        updatePaymentInState(state, action.payload);
      })
      .addCase(rejectPayment.rejected, (state, action) => {
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "שגיאה בדחיית התשלום";
      });
  },
});

export const { resetPaymentsState } = paymentsSlice.actions;
export default paymentsSlice.reducer;

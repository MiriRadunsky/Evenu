import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../services/axios";
import type { Payment } from "../types/type";

// אחרי populate(contractId)
export interface PaymentWithContract extends Payment {
  contractId: string; // אם יש טיפוס ל-Contract, תחליפי כאן
}

export interface PaymentsSummary {
  pendingPaymentsCount: number;
  pendingPaymentsTotal: number;
  overduePaymentsCount: number;
  paidPaymentsCount: number;
}

interface PaymentsState {
  role: "user" | "supplier" | null;
  payments: PaymentWithContract[];
  summary: PaymentsSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  role: null,
  payments: [],
  summary: null,
  loading: false,
  error: null,
};

// חישוב summary בצד הקליינט (אחרי עדכון בודד)
function recalcSummary(state: PaymentsState) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let pendingPaymentsCount = 0;
  let pendingPaymentsTotal = 0;
  let overduePaymentsCount = 0;
  let paidPaymentsCount = 0;

  for (const p of state.payments) {
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

  state.summary = {
    pendingPaymentsCount,
    pendingPaymentsTotal,
    overduePaymentsCount,
    paidPaymentsCount,
  };
}

// 🔹 מביא תשלומים + summary לפי תפקיד מהשרת
export const fetchMyPayments = createAsyncThunk<
  {
    role: "user" | "supplier";
    payments: PaymentWithContract[];
    summary: PaymentsSummary;
  },
  "user" | "supplier"
>("payments/fetchMy", async (role, { rejectWithValue }) => {
  try {
    const url = role === "supplier" ? "/payments/supplier" : "/payments/client";
    const res = await api.get(url);
    console.log(res);

    return res.data; // { role, payments, summary }
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.error ||
      err?.message ||
      "שגיאה בטעינת התשלומים"
    );
  }
});


// 🔹 לקוח – מדווח ששילם (עם קבלה ל-AWS)
export const reportPaymentPaid = createAsyncThunk<
  PaymentWithContract,
  { paymentId: string; method: string; note?: string; documentKey?: string }
>("payments/reportPaid", async ({ paymentId, method, note, documentKey }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/payments/${paymentId}/report-paid`, {
      method,
      note,
      documentKey,
    });
    return res.data; // תשלום מעודכן
  } catch (err: any) {
    const message =
      err?.response?.data?.error ||
      err?.message ||
      "שגיאה בדיווח על תשלום";
    return rejectWithValue(message);
  }
});

// 🔹 ספק – מאשר תשלום (יכול להוסיף קבלה משלו)
export const confirmPaymentPaid = createAsyncThunk<
  PaymentWithContract,
  { paymentId: string; method?: string; note?: string; documentKey?: string }
>("payments/confirmPaid", async ({ paymentId, method, note, documentKey }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/payments/${paymentId}/confirm-paid`, {
      method,
      note,
      documentKey,
    });
    return res.data;
  } catch (err: any) {
    const message =
      err?.response?.data?.error ||
      err?.message ||
      "שגיאה באישור התשלום";
    return rejectWithValue(message);
  }
});

// 🔹 ספק – דוחה תשלום
export const rejectPayment = createAsyncThunk<
  PaymentWithContract,
  { paymentId: string; reason: string }
>("payments/reject", async ({ paymentId, reason }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/payments/${paymentId}/reject-paid`, { reason });
    return res.data;
  } catch (err: any) {
    const message =
      err?.response?.data?.error ||
      err?.message ||
      "שגיאה בדחיית התשלום";
    return rejectWithValue(message);
  }
});

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const updatePaymentInState = (state: PaymentsState, updated: PaymentWithContract) => {
      const idx = state.payments.findIndex(
        (p) => String(p._id) === String(updated._id)
      );
      if (idx !== -1) state.payments[idx] = updated;
      else state.payments.push(updated);
      recalcSummary(state);
    };

    // fetchMyPayments
    builder
      .addCase(fetchMyPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMyPayments.fulfilled,
        (
          state,
          action: PayloadAction<{
            role: "user" | "supplier";
            payments: PaymentWithContract[];
            summary: PaymentsSummary;
          }>
        ) => {
          state.loading = false;
          state.role = action.payload.role;
          state.payments = action.payload.payments;
          state.summary = action.payload.summary;
        }
      )
      .addCase(fetchMyPayments.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "שגיאה בטעינת התשלומים";
      });

    // reportPaymentPaid
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

    // confirmPaymentPaid
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

    // rejectPayment
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

export default paymentsSlice.reducer;


import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../services/axios";
import type { Contract } from "../types/Contract";
import { getErrorMessage } from "@/Utils/error";

interface ContractsPageResult {
  items: Contract[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ContractsState {
  loading: boolean;
  error: string | null;
  data:ContractsPageResult,

}

const initialState: ContractsState = {
 
  data:{
     items: [],
   total: 0,
   page: 1,
   pageSize: 10,
   totalPages: 1,
  },
  loading: false,
  error: null,
};

type FetchParams = {
  page?: number;
  limit?: number;
  status?: string;      
  eventId?: string;
};

/* ---------------------------------------------------
   🔹 FETCH contracts for supplier (עם פגינציה)
   GET /contracts/supplier?page=&limit=&status=&eventId=
--------------------------------------------------- */
export const fetchContractsBySupplier = createAsyncThunk<
  ContractsPageResult,
  FetchParams | void,
  { rejectValue: string }
>(
  "contracts/fetchContractsBySupplier",
  async (params, { rejectWithValue }) => {
    try {
      const query = params ?? {};
      const { data } = await api.get("/contracts/supplier", { params: query });
      // מצופה: { items, total, page, pageSize, totalPages }
      
      return data as ContractsPageResult;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err,'שגיאה בטעינת הזמנות'));
    }
  }
);

/* ---------------------------------------------------
   🔹 FETCH contracts for client (עם פגינציה)
   GET /contracts?page=&limit=&status=&eventId=
--------------------------------------------------- */
export const fetchContractsByClient = createAsyncThunk<
  ContractsPageResult,
  FetchParams | void,
  { rejectValue: string }
>(
  "contracts/fetchContractsByClient",
  async (params, { rejectWithValue }) => {
    try {
      const query = params ?? {};
      const { data } = await api.get("/contracts", { params: query });
      return data as ContractsPageResult;
    } catch (err: unknown) {
     return rejectWithValue(getErrorMessage(err,'שגיאה בטעינת הזמנות'));
    }
  }
);

/* ---------------------------------------------------
   🔹 CREATE contract
   POST /contracts
--------------------------------------------------- */
export const createContract = createAsyncThunk<
  Contract,
  {
    eventId: string;
    clientId?: string;
    s3Key: string;
    paymentPlan: Array<{ dueDate: string; amount: number; note: string }>;
    terms?: string;
  },
  { rejectValue: string }
>("contracts/createContract", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/contracts", payload);
    return data.contract as Contract;
  } catch (err: unknown) {
    console.error(err);
   return rejectWithValue(getErrorMessage(err,'שגיאה ביצירת חוזה'));
  }
});

/* ---------------------------------------------------
   🔹 SIGN contract
   POST /contracts/:id/sign
--------------------------------------------------- */
export const signContract = createAsyncThunk<
  { updatedContract: Contract },
  {
    party: "supplier" | "client";
    contractId: string;
    userId: string;
    signatureKey: string;
  },
  { rejectValue: string }
>("contracts/signContract", async (params, { rejectWithValue }) => {
  try {
    const { contractId, userId, signatureKey, party } = params;

    const { data } = await api.post(`/contracts/${contractId}/sign`, {
      party,
      signatureMeta: {
        timestamp: new Date().toISOString(),
        userId,
      },
      signatureData: signatureKey,
    });

    return data as { updatedContract: Contract };
  } catch (err: unknown) {
   return rejectWithValue(getErrorMessage(err,'שגיאה בחתימת חוזה'));
  }
});

const contractsSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {
    // אם תרצי לנקות state בלוגאאוט וכדומה
    resetContractsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      /* -------- supplier -------- */
      .addCase(fetchContractsBySupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchContractsBySupplier.fulfilled,
        (state, action: PayloadAction<ContractsPageResult>) => {
          state.loading = false;
          state.data=action.payload
        }
      )
      .addCase(fetchContractsBySupplier.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch contracts";
      })

      /* -------- client -------- */
      .addCase(fetchContractsByClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchContractsByClient.fulfilled,
        (state, action: PayloadAction<ContractsPageResult>) => {
          state.loading = false;
          state.data=action.payload
        }
      )
      .addCase(fetchContractsByClient.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch contracts";
      })

      /* -------- create -------- */
      .addCase(createContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createContract.fulfilled,
        (state, action: PayloadAction<Contract>) => {
          state.loading = false;
          // מוסיפים למעלה – תלוי בך, אפשר גם לעשות refetch
          state.data.items.unshift(action.payload);
          state.data.total += 1;

        }
      )
      .addCase(createContract.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to create contract";
      })

      /* -------- sign -------- */
      .addCase(signContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        signContract.fulfilled,
        (state, action: PayloadAction<{ updatedContract: Contract }>) => {
          state.loading = false;
          const updated = action.payload.updatedContract;
          const index = state.data.items.findIndex((c) => c._id === updated._id);
          if (index !== -1) {
            state.data.items[index] = updated;
          }
        }
      )
      .addCase(signContract.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to sign contract";
      });
  },
});

export const { resetContractsState } = contractsSlice.actions;
export default contractsSlice.reducer;

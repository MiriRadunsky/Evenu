// store/contractsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../services/axios";
import type { Contract } from "../types/Contract";



interface ContractsState {
  contracts: Contract[];
  loading: boolean;
  error: string;
}

const initialState: ContractsState = {
  contracts: [],
  loading: false,
  error: '',
};

/* ---------------------------------------------------
   🔹 FETCH contracts for supplier
   GET /contracts/supplier
--------------------------------------------------- */
export const fetchContractsBySupplier = createAsyncThunk<
  Contract[],
  void,
  { rejectValue: string }
>("contracts/fetchContractsBySupplier", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/contracts/supplier");
    console.log(data);
    return data.contracts;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch contracts");
  }
});
/* ---------------------------------------------------
   🔹 FETCH contracts for client
   await api.get("/contracts");
--------------------------------------------------- */
export const fetchContractsByClient = createAsyncThunk<
  Contract[],
  void,
  { rejectValue: string }
>("contracts/fetchContractsByClient", async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/contracts");
      console.log('data',data);
      return data.contracts;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch contracts");
    }
})
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
    paymentPlan: Array<{ dueDate?: string; amount?: number; note?: string }>;
    totalAmount: number;
    terms?: string;
  }
>(
  "contracts/createContract",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/contracts", payload);
      console.log(data);
      
      return data.contract;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to create contract");
    }
  }
);
//sign

export const signContract = createAsyncThunk(
  "contracts/signContract",
  async (
    params: {
      party: "supplier" | "client";
      contractId: string;
      userId: string;
      signatureKey: string;
    },
    thunkAPI
  ) => {
    try {
      const { contractId, userId, signatureKey , party} = params;

      const res = await api.post(`/contracts/${contractId}/sign`, {
        party: party,
        signatureMeta: {
          timestamp: new Date().toISOString(),
          userId,
        },
        signatureData: signatureKey,
      });
console.log(res.data);

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);
const contractsSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch contracts
      .addCase(fetchContractsBySupplier.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchContractsBySupplier.fulfilled, (state, action: PayloadAction<Contract[]>) => {
        state.loading = false;
        state.contracts = action.payload;
      })
      .addCase(fetchContractsBySupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload|| "Failed to fetch contracts";
      })
        // Fetch contracts for client
        .addCase(fetchContractsByClient.pending, (state) => {
          state.loading = true;
          state.error = '';
        })
        .addCase(fetchContractsByClient.fulfilled, (state, action: PayloadAction<Contract[]>) => {
          state.loading = false;
          state.contracts = action.payload;
        })
        .addCase(fetchContractsByClient.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload|| "Failed to fetch contracts";
        })
      // Create contract
      .addCase(createContract.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(createContract.fulfilled, (state, action: PayloadAction<Contract>) => {
        state.loading = false;
        state.contracts.push(action.payload);
      })
      .addCase(createContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create contract";
      })
      .addCase(signContract.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(signContract.fulfilled, (state, action) => {
        state.loading = false;
        const updatedContract = action.payload.updatedContract;
        const index = state.contracts.findIndex(
          (contract) => contract._id === updatedContract._id
        );
        if (index !== -1) {
          state.contracts[index] = updatedContract;
        }
      })
      .addCase(signContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to sign contract";
      });

  },
});

export default contractsSlice.reducer;

// // Selector נוח לשימוש בקומפוננטה
// export const selectSupplierContracts = (state: { contracts: ContractsState }) =>
//   state.contracts.contracts;

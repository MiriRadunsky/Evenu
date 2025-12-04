import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { AppDispatch } from "../../store";
import { Button } from "../../components/ui/button";
import { fetchRequestsBySupplier } from "../../store/requestSlice";
import { CreateContractDialog } from "../../components/ContractsAndPayments/CreateContractDialog";
import ContractList from "../../components/ContractsAndPayments/ContractList";

export default function SupplierContractsPage() {
  const dispatch: AppDispatch = useDispatch();
  const [showCreateContractDialog, setShowCreateContractDialog] =
    useState(false);

  useEffect(() => {
    // רק הבקשות – כדי שעבור יצירת חוזה יהיו נתונים
    dispatch(fetchRequestsBySupplier());
  }, [dispatch]);

  return (
    <div className="space-y-4" style={{ direction: "rtl" }}>
      <Button onClick={() => setShowCreateContractDialog(true)}>
        <Plus className="w-4 h-4 ml-2" />
        יצירת חוזה חדש
      </Button>

      <ContractList type="supplier" />

      <CreateContractDialog
        open={showCreateContractDialog}
        onOpenChange={setShowCreateContractDialog}
      />
    </div>
  );
}

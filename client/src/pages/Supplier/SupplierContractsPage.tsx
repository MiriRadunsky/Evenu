import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { fetchContractsBySupplier } from "../../store/contractsSlice";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import ContractList from "../../components/Contracts/contractList";
import { CreateContractDialog } from "../../components/supplier/CreateContractDialog";
import { fetchRequestsBySupplier } from "../../store/requestSlice";

export default function SupplierContractsPage() {
    const dispatch: AppDispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchContractsBySupplier());
    dispatch(fetchRequestsBySupplier());
  }, [dispatch]);
  const [showCreateContractDialog, setShowCreateContractDialog] =
    useState(false);
  return (
     <div className="space-y-4">
          <Button
            onClick={() => setShowCreateContractDialog(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 ml-2" />
            יצירת חוזה חדש
          </Button>
        <ContractList type="supplier" />
         <CreateContractDialog
                open={showCreateContractDialog}
                onOpenChange={(open) => {
                  setShowCreateContractDialog(open);
                }}
              />
        </div>
  )
} 
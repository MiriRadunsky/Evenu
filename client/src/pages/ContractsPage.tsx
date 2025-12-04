// import { useDispatch } from "react-redux";
// import { fetchContractsByClient } from "../store/contractsSlice";
// import type { AppDispatch } from "../store";
// import { useEffect } from "react";
// import ContractList from "../components/ContractsAndPayments/contractList";

// export default function ContractsPage() {
//   const dispatch:AppDispatch= useDispatch();
//     useEffect(() => {
//       dispatch(fetchContractsByClient());
//     }, [dispatch]);
//     return(
//       <ContractList type="client" />
//     )
// }

// pages/ContractsPage.tsx
import ContractList from "../components/ContractsAndPayments/ContractList";

export default function ContractsPage() {
  return (
    <div className="space-y-4" style={{ direction: "rtl" }}>
      <ContractList type="client" />
    </div>
  );
}

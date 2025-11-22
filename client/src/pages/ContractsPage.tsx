import { useDispatch } from "react-redux";
import { fetchContractsByClient } from "../store/contractsSlice";
import type { AppDispatch } from "../store";
import { useEffect } from "react";
import ContractList from "../components/Contracts/contractList";

export default function ContractsPage() {
  const dispatch:AppDispatch= useDispatch();
    useEffect(() => {
      dispatch(fetchContractsByClient());
    }, [dispatch]);
    return(
      <ContractList type="client" />
    )
}
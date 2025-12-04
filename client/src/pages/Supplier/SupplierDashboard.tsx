import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { fetchDashboardSummarySupplier } from "../../store/dashboardSlice";
import { useEffect } from "react";
import Dashboard from "../../components/Dashboard";


export default function SupplierDashboard() {
  const dispatch: AppDispatch = useDispatch();
 
   useEffect(() => {
     dispatch(fetchDashboardSummarySupplier());
   }, [dispatch]);
   return (<Dashboard />)
  }
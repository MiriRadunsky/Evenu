import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { useEffect } from "react";
import { fetchRequestsBySupplier } from "../../store/requestSlice";
import RequestList from "../../components/Request/RequestList";
export default function SupplierRequestPage() {
  const dispatch: AppDispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchRequestsBySupplier());
  }, [dispatch]);

  return (
  <RequestList type="supplier" />
  )
}

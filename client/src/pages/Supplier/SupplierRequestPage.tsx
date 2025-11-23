import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { useEffect } from "react";
import { fetchRequestsBySupplier } from "../../store/requestSlice";
import RequestList from "../../components/Request/RequestList";
export default function SupplierRequestPage() {
  const dispatch: AppDispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchRequestsBySupplier());
  console.log("in comp ", requests);

  }, [dispatch]);
  const { requests, loading, error } = useSelector(
    (state: RootState) => state.requests
  );

  return (
    <RequestList type="supplier" />
  )
}

import RequestList from "../components/Request/RequestList";
import { fetchRequests } from "../store/requestSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { useEffect } from "react";

export function RequestPage() {
  const dispatch:AppDispatch=useDispatch();
  useEffect(()=>{
    dispatch(fetchRequests());
  }, [dispatch]);
  
  return (
    <>
      <RequestList
        type="client"
      />
    </>
  );
}

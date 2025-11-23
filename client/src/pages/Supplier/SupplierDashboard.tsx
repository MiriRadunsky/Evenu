import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import {
  CheckCircle,
  Clock,
  FileText
} from "lucide-react";
import {  useDispatch, useSelector } from "react-redux";
import type {  AppDispatch, RootState } from "../../store";
import type { Request } from "../../types/Request";
import { useEffect } from "react";
import { fetchRequestsBySupplier } from "../../store/requestSlice";
import { fetchContractsBySupplier } from "../../store/contractsSlice";



export default function SupplierDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);
  const requests = useSelector(
    (state: RootState) => state.requests.requests
  );
  const contracts = useSelector(
    (state: RootState) => state.contracts.contracts
  );
 
  
  const dispatch: AppDispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchContractsBySupplier());
    dispatch(fetchRequestsBySupplier());
  }, [dispatch]);
  const filterRequestsByStatus = (status: string) => {
    if(!requests) return 0;
    return requests.filter((r: Request) => r.status === status).length;
  };

  return (
    <div className="space-y-6 p-6" style={{ direction: "rtl" }}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">שלום, {user?.name || "ספק"}</h1>
      </div>

      {/* סטטיסטיקות */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">בקשות ממתינות</CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {filterRequestsByStatus("ממתין")}
            </div>
            <p className="text-sm text-muted-foreground">בקשות שצריכות מענה</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">בקשות מאושרות</CardTitle>
            <CheckCircle className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {filterRequestsByStatus("מאושר")}
            </div>
            <p className="text-sm text-muted-foreground">בקשות מאושרות</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">חוזים פעילים</CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{contracts.length}</div>
            <p className="text-sm text-muted-foreground">חוזים פעילים</p>
          </CardContent>
        </Card>
      </div>
     
    </div>
  );
}



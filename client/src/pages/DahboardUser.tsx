import { Link } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { FileText, Plus, Search } from "lucide-react";
import { useEffect } from "react";
import { fetchDashboardSummaryUser } from "../store/dashboardSlice";
import type { AppDispatch } from "../store";
import { useDispatch } from "react-redux";
import Dashboard from "../components/Dashboard";

export default function DashboardUser() {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchDashboardSummaryUser());
  }, [dispatch]);
  return (
    <>
      <Dashboard />
      <div className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to={"/my-events"}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Plus className="h-8 w-8 text-primary" />
                <h3 className="font-bold">צור אירוע חדש</h3>
                <p className="text-sm text-muted-foreground">
                  הוסף אירוע חדש למערכת
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={"/suppliers"}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Search className="h-8 w-8 text-primary" />
                <h3 className="font-bold">חפש ספקים</h3>
                <p className="text-sm text-muted-foreground">
                  עיין בקטלוג הספקים
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={"/contracts-payments"}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <FileText className="h-8 w-8 text-primary" />
                <h3 className="font-bold">צפה בתשלומים</h3>
                <p className="text-sm text-muted-foreground">
                  נהל חוזים ותשלומים
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
      </div>
      

    </>
  );
}

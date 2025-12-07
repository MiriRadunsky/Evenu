import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  approveRequest,
  declineRequest,
  SetSelectedSupplierRequest,
  fetchRequests,
  fetchRequestsBySupplier,
} from "../../store/requestSlice";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { AlertCircle, Calendar, Send } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

import type { AppDispatch, RootState } from "../../store";
import { CreateContractDialog } from "../ContractsAndPayments/CreateContractDialog";
import { fetchEvents } from "../../store/eventsSlice";
import { RequestCard } from "./RequestCard";
import { Card, CardContent } from "../ui/card";

interface RequestListProps {
  type: "user" | "supplier";
}

export default function RequestList({ type }: RequestListProps) {
  const dispatch: AppDispatch = useDispatch();

  const { data, loading, error } = useSelector(
    (state: RootState) => state.requests
  );

  const events = useSelector((state: RootState) => state.events.eventsList);

  const requests = useMemo(() => {
    return data?.items ?? [];
  }, [data]);
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 10;

  const [selectedTab, setSelectedTab] = useState("הכל");
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [showCreateContractDialog, setShowCreateContractDialog] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const resolvedMode: "user" | "supplier" = type;
  const actionLoading = loading;
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    if (resolvedMode === "user" && events.length === 0) {
      dispatch(fetchEvents());
    }
  }, [resolvedMode, events.length, dispatch]);

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    setPage(() => 1);
  };

  const handleEventChange = (value: string) => {
    setSelectedEventId(value);
    setPage(1);
  };

  useEffect(() => {
    const status = selectedTab === "הכל" ? undefined : selectedTab;
    const eventId = selectedEventId === "all" ? undefined : selectedEventId;

    const query = { page, limit: pageSize, status, eventId, debouncedSearch };

    if (resolvedMode === "supplier") {
      dispatch(fetchRequestsBySupplier(query));
    } else {
      dispatch(fetchRequests(query));
    }
  }, [
    dispatch,
    resolvedMode,
    page,
    selectedTab,
    selectedEventId,
    pageSize,
    debouncedSearch,
  ]);

  const handleAttachContract = (requestId: string) => {
    dispatch(SetSelectedSupplierRequest({ id: requestId }));
    setShowCreateContractDialog(true);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-black">בקשות שלי</h1>
        </div>
      </div>

      <div className="text-sm text-muted-foreground text-left">
        סך הכל {total} בקשות
      </div>

      {/* כרטיס סינונים + חיפוש */}
      <Card className="w-full border border-primary rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          {/* חיפוש */}
          <div className="w-full max-w-md">
            <input
              type="text"
              placeholder="חיפוש לפי אירוע / ספק / לקוח / הערה..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full border border-primary rounded-lg px-4 py-2 text-sm bg-white 
                focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ direction: "rtl" }}
            />
          </div>

          {/* סינון לפי אירוע — רק למשתמש */}
          {resolvedMode === "user" && (
            <>
              <div className="space-y-1 text-right">
                <p className="text-sm font-medium">סינון</p>
                <p className="text-xs text-muted-foreground">
                  אפשר לראות בקשות לפי אירוע
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  אירוע:
                </span>

                <Select
                  value={selectedEventId}
                  onValueChange={handleEventChange}
                >
                  <SelectTrigger className="w-56 border-primary">
                    <SelectValue placeholder="בחר אירוע" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">כל האירועים</SelectItem>
                    {events?.map((ev) => (
                      <SelectItem key={ev._id} value={ev._id}>
                        {ev.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </Card>

      <Tabs value={selectedTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="הכל">הכל</TabsTrigger>
          <TabsTrigger value="ממתין">ממתין</TabsTrigger>
          <TabsTrigger value="מאושר">אושר</TabsTrigger>
          <TabsTrigger value="נדחה">נדחה</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {error && (
            <div className="bg-red-50 p-4 rounded-lg text-red-800 flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                <p className="text-muted-foreground">טוען בקשות...</p>
              </div>
            </div>
          ) : requests.length > 0 ? (
            <>
              <div className="space-y-3">
                {requests.map((request) => (
                  <RequestCard
                    key={request._id}
                    request={request}
                    mode={resolvedMode}
                    expanded={expandedRequest === request._id}
                    onToggleExpand={() =>
                      setExpandedRequest(
                        expandedRequest === request._id ? null : request._id
                      )
                    }
                    onAttachContract={
                      resolvedMode === "supplier"
                        ? () => handleAttachContract(request._id)
                        : undefined
                    }
                    onApprove={
                      resolvedMode === "supplier"
                        ? () => dispatch(approveRequest(request._id))
                        : undefined
                    }
                    onDecline={
                      resolvedMode === "supplier"
                        ? () => dispatch(declineRequest(request._id))
                        : undefined
                    }
                    loadingActions={actionLoading}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="text-muted-foreground">
                    סה"כ {total} בקשות • עמוד {page} מתוך {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={page <= 1 || loading}
                    >
                      הקודם
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={page >= totalPages || loading}
                    >
                      הבא
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">
                  אין בקשות להצגה
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  הבקשות שלך יופיעו כאן כאשר יווצרו
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CreateContractDialog
        open={showCreateContractDialog}
        onOpenChange={setShowCreateContractDialog}
      />
    </div>
  );
}

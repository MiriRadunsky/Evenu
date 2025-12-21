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
import type { Event } from "../../types/Event";
import { CreateContractDialog } from "../ContractsAndPayments/CreateContractDialog";
import { fetchRelevantEvents } from "../../store/eventsSlice";
import { fetchCategories } from "../../store/categoriesSlice";
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
  const categories = useSelector((state: RootState) => state.categories.list);

  const requests = useMemo(() => {
    return data?.items ?? [];
  }, [data]);

  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 10;

  const [selectedTab, setSelectedTab] = useState("הכל");
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [showCreateContractDialog, setShowCreateContractDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const resolvedMode: "user" | "supplier" = type;
  const actionLoading = loading;
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const eventsForDropdown = useMemo(() => {
    if (selectedCategory && selectedCategory !== "all") {
      const map = new Map<string, Event>();
      for (const r of requests) {
        const ev = r.eventId;
        if (ev && ev._id) {
          map.set(ev._id, ev);
        }
      }
      return Array.from(map.values());
    }
    return events;
  }, [selectedCategory, requests, events]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(fetchRelevantEvents());
    dispatch(fetchCategories());
  }, [dispatch]);

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
    const query = {
      page,
      limit: pageSize,
      status,
      eventId,
      searchTerm: debouncedSearch,
      category: selectedCategory === "all" ? undefined : selectedCategory,
    };
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
    selectedCategory,
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

      <Card className="border border-primary/40 rounded-xl bg-white p-4 shadow-sm">
        <div className="space-y-4">
          <div className="w-full">
            <input
              type="text"
              placeholder="חיפוש לפי ספק"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full border border-primary/40 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ direction: "rtl" }}
            />
          </div>
{type === "user" && (
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="space-y-1">
              <p className="text-sm font-semibold">סינון</p>
              <p className="text-xs text-muted-foreground">
                סנן לפי אירוע וקטגוריה
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2 md:gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                  <Calendar className="w-4 h-4" />
                  אירוע:
                </span>

                <Select value={selectedEventId} onValueChange={handleEventChange}>
                  <SelectTrigger className="flex-1 sm:w-40 border-primary/40">
                    <SelectValue placeholder="בחר אירוע" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל האירועים</SelectItem>
                    {eventsForDropdown?.map((ev) => (
                      <SelectItem key={ev._id} value={ev._id}>
                        {ev.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  קטגוריה:
                </span>

                <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setPage(1); setSelectedEventId("all"); }}>
                  <SelectTrigger className="flex-1 sm:w-40 border-primary/40">
                    <SelectValue placeholder="כל הקטגוריות" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הקטגוריות</SelectItem>
                    {categories?.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
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

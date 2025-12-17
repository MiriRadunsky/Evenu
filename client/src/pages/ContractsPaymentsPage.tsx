import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  AlertCircle,
  DollarSign,
  CheckCircle,
  Clock,
  FileText,
  ExternalLink,
  Calendar,
  Wallet,
} from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";

import {
  fetchClientPayments,
  fetchSupplierPayments,
} from "../store/paymentsSlice";
import { fetchEvents } from "../store/eventsSlice";

import { SupplierPaymentActions } from "../components/ContractsAndPayments/SupplierPaymentActions";
import { ClientReportPaymentDialog } from "../components/ContractsAndPayments/ClientReportPaymentDialog";

import { getImageUrl } from "../services/uploadFile";
import { toast } from "sonner";
import { getStatusBadgeClass } from "../Utils/PaymentUtils";
import { formatEventDate } from "../Utils/DataUtils";
import type { Payment } from "../types/Payment";

type StatusTab = "הכל" | "ממתין" | "ממתין לספק" | "שולם" | "נדחה" | "באיחור";

export default function ContractsPaymentsPage() {
  const dispatch: AppDispatch = useDispatch();

  const { data, loading, error, role } = useSelector(
    (state: RootState) => state.payments
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const events = useSelector((state: RootState) => state.events.eventsList);

  const payments = data.items;
  const summary = data.summary;
  const total = data.total;
  const serverPage = data.page;
  const totalPages = data.totalPages;
  const pageSize = data.pageSize;

  const [selectedTab, setSelectedTab] = useState<StatusTab>("הכל");
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    if (user?.role === "user") {
      dispatch(fetchEvents({ page: 1, pageSize: 10 }));
    }
  }, [dispatch, user?.role]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    if (!user?.role || (user.role !== "user" && user.role !== "supplier")) return;

    let statusParam: string | undefined = undefined;
    if (selectedTab !== "הכל" && selectedTab !== "באיחור") {
      statusParam = selectedTab;
    }

    const eventIdParam =
      selectedEventId === "all" ? undefined : selectedEventId;

    const commonQuery = {
      page: currentPage,
      limit: pageSize,
      status: statusParam,
      eventId: eventIdParam,
      searchTerm: debouncedSearchTerm,
    };

    if (user.role === "user") {
      dispatch(fetchClientPayments(commonQuery));
    } else if (user.role === "supplier") {
      dispatch(fetchSupplierPayments(commonQuery));
    }
  }, [
    dispatch,
    user?.role,
    selectedTab,
    selectedEventId,
    currentPage,
    pageSize,
    debouncedSearchTerm,
  ]);

  useEffect(() => {
    if (serverPage && serverPage !== currentPage) {
      setCurrentPage(serverPage);
    }
  }, [serverPage, currentPage]);

  const handleViewReceipt = async (key: string) => {
    try {
      const url = await getImageUrl(key);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err:string | unknown) {
     const errorText = String(err);
      toast.error(errorText);
    }
  };

  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    if (selectedTab !== "באיחור") return payments;

    const now = new Date();
    return payments.filter((p: Payment) => {
      if (p.status !== "ממתין" || !p.dueDate) return false;
      return new Date(p.dueDate) < now;
    });
  }, [payments, selectedTab]);

  const handleChangePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setCurrentPage(nextPage);
  };

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center justify-between gap-2">
          <Wallet className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-black">תשלומים</h1>
        </div>
      </div>

      <div className="text-sm text-muted-foreground text-left">
        סך הכל {total} תשלומים
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-primary/30 rounded-xl bg-white text-black">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              תשלומים ממתינים
            </CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {summary?.pendingPaymentsCount ?? 0}
            </p>
            <p className="text-sm text-muted-foreground">
              סה"כ: ₪{(summary?.pendingPaymentsTotal ?? 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-primary/30 rounded-xl bg-white text-black">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              תשלומים באיחור
            </CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {summary?.overduePaymentsCount ?? 0}
            </p>
            <p className="text-sm text-muted-foreground">
              תשלומים שעברו את מועד הפירעון
            </p>
          </CardContent>
        </Card>

        <Card className="border border-primary/30 rounded-xl bg-white text-black">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              תשלומים ששולמו
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {summary?.paidPaymentsCount ?? 0}
            </p>
            <p className="text-sm text-muted-foreground">
              תשלומים שסומנו כ"שולם"
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-primary/40 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-md">
            <input
              type="text"
              placeholder="חיפוש לפי אירוע / ספק / לקוח / הערה..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              className="w-full border border-primary/40 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ direction: "rtl" }}
            />
          </div>

          {/* סינון לפי אירוע – רק ללקוח, רספונסיבי */}
          {user?.role === "user" && (
            <div className="w-full md:w-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
              <div className="space-y-1 text-right md:text-left">
                <p className="text-sm font-semibold">סינון</p>
                <p className="text-xs text-muted-foreground">
                  אפשר לראות תשלומים לפי אירוע
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  אירוע:
                </span>

                <Select
                  value={selectedEventId}
                  onValueChange={(value) => {
                    setSelectedEventId(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full md:w-56 border-primary/40">
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
            </div>
          )}
        </div>
      </Card>

      <Tabs
        value={selectedTab}
        onValueChange={(value) => {
          setSelectedTab(value as StatusTab);
          setCurrentPage(1);
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="הכל">הכל</TabsTrigger>
          <TabsTrigger value="ממתין">ממתין</TabsTrigger>
          <TabsTrigger value="ממתין לספק">ממתין לספק</TabsTrigger>
          <TabsTrigger value="שולם">שולם</TabsTrigger>
          <TabsTrigger value="נדחה">נדחה</TabsTrigger>
          <TabsTrigger value="באיחור">באיחור</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-800 flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                <p className="text-muted-foreground">טוען תשלומים...</p>
              </div>
            </div>
          )}

          {!loading && filteredPayments.length === 0 && !error && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">
                  אין תשלומים להצגה
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  התשלומים שלך יופיעו כאן כאשר יווצרו
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && filteredPayments.length > 0 && (
            <>
              <div className="space-y-3">
                {filteredPayments.map((payment: Payment) => {
                  const contract = payment.contractId;
                  const event = contract?.eventId;

                  const isPending = payment.status === "ממתין";
                  const isPendingForSupplier = payment.status === "ממתין לספק";
                  const isRejected = payment.status === "נדחה";

                  const dueDateText = payment.dueDate
                    ? formatEventDate(payment.dueDate)
                    : "ללא תאריך";

                  const clientEvidenceKey = payment.clientEvidenceKey;
                  const supplierEvidenceKey = payment.supplierEvidenceKey;

                  return (
                    <Card
                      key={payment._id}
                      className="border border-primary/30 rounded-xl bg-white"
                    >
                      <CardContent className="p-4 flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1 text-sm text-slate-800">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                              {event?.name || "חוזה / אירוע"}
                            </span>
                          </div>

                          <span className="text-xs text-muted-foreground">
                            {role === "supplier"
                              ? `לקוח: ${contract?.clientId?.name || ""}`
                              : `ספק: ${
                                  contract?.supplierId?.user?.name ||
                                  contract?.supplierId?.name ||
                                  ""
                                }`}
                          </span>

                          {payment.note && (
                            <span className="text-xs text-muted-foreground">
                              הערה: {payment.note}
                            </span>
                          )}

                          <div className="flex flex-wrap gap-2 mt-1">
                            {clientEvidenceKey && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleViewReceipt(clientEvidenceKey)
                                }
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                קבלה שהעלה הלקוח
                              </button>
                            )}
                            {supplierEvidenceKey && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleViewReceipt(supplierEvidenceKey)
                                }
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                קבלה שהעלה הספק
                              </button>
                            )}
                          </div>

                          {isRejected && payment.rejectedReason && (
                            <span className="text-xs text-destructive mt-1">
                              סיבת דחייה: {payment.rejectedReason}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2 text-right">
                          <span className="font-bold text-black">
                            ₪{payment.amount?.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            מועד תשלום: {dueDateText}
                          </span>

                          <Badge
                            variant="outline"
                            className={getStatusBadgeClass(payment.status)}
                          >
                            {payment.status}
                          </Badge>

                          {isPending && role === "user" && (
                            <ClientReportPaymentDialog
                              paymentId={payment._id}
                              defaultAmount={payment.amount}
                              onSuccess={() => {}}
                            />
                          )}

                          {isPendingForSupplier && role === "supplier" && (
                            <SupplierPaymentActions
                              paymentId={payment._id}
                              defaultAmount={payment.amount}
                              onSuccess={() => {}}
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6 text-sm">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChangePage(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  >
                    הקודם
                  </Button>
                  <span className="text-muted-foreground">
                    עמוד {currentPage} מתוך {totalPages} • סה"כ {total} תשלומים
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChangePage(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                  >
                    הבא
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

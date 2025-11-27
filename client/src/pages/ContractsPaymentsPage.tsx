import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchMyPayments } from "../store/paymentsSlice";
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
  FileText,
  ExternalLink,
} from "lucide-react";
import { formatEventDate } from "../Utils/DataUtils";
import { ClientReportPaymentDialog } from "../components/ContractsAndPayments/ClientReportPaymentDialog";
import { SupplierPaymentActions } from "../components/ContractsAndPayments/SupplierPaymentActions";
import { getImageUrl } from "../services/uploadFile";
import { toast } from "sonner";

type StatusFilter = "הכל" | "ממתין" | "שולם" | "באיחור" | "נדחה";

export default function ContractsPaymentsPage() {
  const dispatch: AppDispatch = useDispatch();
  const { payments, summary, loading, error, role } = useSelector(
    (state: RootState) => state.payments
  );
  const user = useSelector((state: RootState) => state.auth.user);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("הכל");

 useEffect(() => {
  if (user?.role && (user.role === "supplier" || user.role === "user")) {
    dispatch(fetchMyPayments(user.role));
  }
}, [dispatch, user?.role]);


  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    const now = new Date();

    return payments.filter((p: any) => {
      if (statusFilter === "הכל") return true;
      if (statusFilter === "ממתין") return p.status === "ממתין";
      if (statusFilter === "שולם") return p.status === "שולם";
      if (statusFilter === "נדחה") return p.status === "נדחה";

      if (statusFilter === "באיחור") {
        if (p.status !== "ממתין" || !p.dueDate) return false;
        return new Date(p.dueDate) < now;
      }

      return true;
    });
  }, [payments, statusFilter]);

  const handleViewReceipt = async (key: string) => {
    try {
      const url = await getImageUrl(key);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      toast.error("שגיאה בפתיחת הקבלה");
    }
  };

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">תשלומים וחוזים</h1>
          <p className="text-sm text-muted-foreground">
            {role === "supplier"
              ? "תשלומים הקשורים לחוזים שלך כספק"
              : "תשלומים עבור האירועים שלך כלקוח"}
          </p>
        </div>
      </div>

      {/* כרטיסי סיכום – 3 בשורה */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              תשלומים ממתינים
            </CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {summary?.pendingPaymentsCount || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              סה"כ: ₪{(summary?.pendingPaymentsTotal || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              תשלומים באיחור
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {summary?.overduePaymentsCount || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              תשלומים שעברו את מועד הפירעון
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              תשלומים ששולמו
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {summary?.paidPaymentsCount || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              תשלומים שסומנו כ"שולם"
            </p>
          </CardContent>
        </Card>
      </div>

      {/* פילטר */}
      <Card>
        <CardHeader>
          <CardTitle>רשימת תשלומים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === "הכל" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("הכל")}
            >
              הכל
            </Button>
            <Button
              variant={statusFilter === "ממתין" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("ממתין")}
            >
              ממתינים
            </Button>
            <Button
              variant={statusFilter === "באיחור" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("באיחור")}
            >
              באיחור
            </Button>
            <Button
              variant={statusFilter === "שולם" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("שולם")}
            >
              שולמו
            </Button>
            <Button
              variant={statusFilter === "נדחה" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("נדחה")}
            >
              נדחו
            </Button>
          </div>

          {loading && <p>טוען תשלומים...</p>}
          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}

          {!loading && filteredPayments.length === 0 && (
            <p className="text-sm text-muted-foreground">
              אין תשלומים להצגה.
            </p>
          )}

          {!loading && filteredPayments.length > 0 && (
            <div className="space-y-2">
              {filteredPayments.map((payment: any) => {
                const contract = payment.contractId;
                const event = contract?.eventId;

                const isPending = payment.status === "ממתין";
                const isPaid = payment.status === "שולם";
                const isRejected = payment.status === "נדחה";

                let statusVariant:
                  | "default"
                  | "secondary"
                  | "destructive"
                  | "outline" = "outline";

                if (isPaid) statusVariant = "secondary";
                if (isPending) statusVariant = "default";
                if (isRejected) statusVariant = "destructive";

                const dueDateText = payment.dueDate
                  ? formatEventDate(payment.dueDate)
                  : "ללא תאריך";

                const clientEvidenceKey = payment.clientEvidenceKey;
                const supplierEvidenceKey = payment.supplierEvidenceKey;

                return (
                  <div
                    key={payment._id}
                    className="flex items-start justify-between border rounded-lg p-3 gap-4"
                  >
                    <div className="flex flex-col gap-1">
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

                      {/* קבלות – אם יש */}
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

                      {/* אם נדחה – להציג סיבת דחייה */}
                      {payment.status === "נדחה" && payment.rejectedReason && (
                        <span className="text-xs text-destructive">
                          סיבת דחייה: {payment.rejectedReason}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="font-bold">
                        ₪{payment.amount?.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        מועד תשלום: {dueDateText}
                      </span>
                      <Badge variant={statusVariant}>{payment.status}</Badge>

                      {/* כפתורי פעולה */}
                      {isPending && role === "user" && (
                        <ClientReportPaymentDialog
                          paymentId={payment._id}
                          defaultAmount={payment.amount}
                          onSuccess={() => {}}
                        />
                      )}

                      {payment.status==='ממתין לספק' && role === "supplier" && (
                        <SupplierPaymentActions
                          paymentId={payment._id}
                          defaultAmount={payment.amount}
                          onSuccess={() => {}}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

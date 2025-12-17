import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Upload,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import type { Request } from "../../types/Request";
import { formatRequestDate } from "../../Utils/DataUtils";
import {
  GOLD_CARD_BORDER,
  GOLD_LABEL,
} from "../../Utils/requestStatus";
import { useNavigate } from "react-router-dom";

type Mode = "user" | "supplier";

interface RequestCardProps {
  request: Request;
  mode: Mode;
  expanded: boolean;
  onToggleExpand: () => void;

  onApprove?: () => void;
  onDecline?: () => void;
  onAttachContract?: () => void;
  loadingActions?: boolean;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "ממתין":
      return <Clock className="w-4 h-4" />;
    case "מאושר":
      return <CheckCircle className="w-4 h-4" />;
    case "נדחה":
      return <XCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
}

export function RequestCard({
  request,
  mode,
  expanded,
  onToggleExpand,
  onApprove,
  onDecline,
  onAttachContract,
  loadingActions = false,
}: RequestCardProps) {
  const navigate = useNavigate();

  const title =
    request.eventId?.name ||
    request.basicEventSummary?.eventName ||
    "אירוע";

  const dateLabel = request.basicEventSummary?.date
    ? formatRequestDate(request.basicEventSummary.date)
    : "—";

  const locationLabel = request.basicEventSummary?.location;
  const typeLabel = request.basicEventSummary?.type;

  const fromToText =
    mode === "supplier"
      ? `מ: ${request.clientId?.name || request.clientId?.email || "לקוח"}`
      : `לספק: ${
          request.supplierId?.user?.name ||
          request.supplierId?.user?.email ||
          "—"
        }`;

  return (
    <Card className={GOLD_CARD_BORDER}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <CardTitle className="text-lg font-semibold text-slate-800">
              {title}
            </CardTitle>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary text-slate-700">
                <span className="font-medium">תאריך:&nbsp;</span>
                <span>{dateLabel}</span>
              </div>

              {locationLabel && (
                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="font-medium">מיקום:&nbsp;</span>
                  <span>{locationLabel}</span>
                </div>
              )}

              {typeLabel && (
                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary text-slate-700">
                  <span className="font-medium">סוג:&nbsp;</span>
                  <span>{typeLabel}</span>
                </div>
              )}
            </div>

            {/* מ/ל */}
            <p className="text-sm text-slate-700">{fromToText}</p>
          </div>

          {/* ימין – סטטוס + תאריך */}
          <div className="flex flex-col items-end gap-2 text-xs">
            <div className="w-9 h-9 rounded-full border flex items-center justify-center bg-primary/10 border-primary text-slate-700">
              {getStatusIcon(request.status)}
            </div>

            {request.status}

            <span className="text-slate-500">
              נשלח:&nbsp;
              {request.createdAt
                ? new Date(request.createdAt).toLocaleDateString("he-IL")
                : "—"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className={GOLD_LABEL}>פרטים נוספים</span>
          <Button variant="link" size="sm" onClick={onToggleExpand}>
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 ml-1" />
                הסתר
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 ml-1" />
                הצג
              </>
            )}
          </Button>
        </div>

        {expanded && (
          <div className="pt-2 space-y-4 text-sm">
            {/* הערות */}
            {request.notesFromClient && (
              <div>
                <p className={GOLD_LABEL + " mb-1"}>הערות מהלקוח:</p>
                <p className="text-slate-700">{request.notesFromClient}</p>
              </div>
            )}

            {/* צ'אט + חוזה */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="link"
                className="flex-1"
                onClick={() =>
                  navigate(mode === "supplier" ? `/supplier/chat` : `/chat`)
                }
              >
                <MessageSquare className="w-4 h-4 ml-2" />
                צפה בצ'אט
              </Button>

              {onAttachContract && request.status === "מאושר" &&(
                <Button
                  variant="link"
                  className="flex-1"
                  onClick={onAttachContract}
                >
                  <Upload className="w-4 h-4 ml-2" />
                  צרף חוזה
                </Button>
              )}
            </div>

            {/* פעולות ספק */}
            {mode === "supplier" && request.status === "ממתין" && (
              <div className="flex gap-2 justify-end pt-2">
                {onDecline && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDecline}
                    disabled={loadingActions}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 ml-2" />
                    דחה
                  </Button>
                )}

                {onApprove && (
                  <Button
                    size="sm"
                    onClick={onApprove}
                    disabled={loadingActions}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    אשר
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

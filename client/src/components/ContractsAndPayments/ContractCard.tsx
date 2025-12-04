import {
  Calendar,
  Mail,
  User,
  Clock,
  CheckCircle,
  Download,
  PenTool,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { Contract } from "../../types/Contract";
import { ContractSignaturesSection } from "./ContractSignaturesSection";
import { PaymentPlanSection } from "./PaymentPlanSection";

interface SignaturesSummary {
  supplierSigned: boolean;
  clientsCount: number;
}

interface ContractCardProps {
  contract: Contract;
  isExpanded: boolean;
  onToggleSignatures: () => void;
  onDownload: () => void;
  onSignClick: () => void;
  signing: boolean;
  canSign: boolean;
  bothSigned: boolean;
  signaturesSummary: SignaturesSummary;
  signatureUrls: Record<string, string>;
}

export function ContractCard({
  contract,
  isExpanded,
  onToggleSignatures,
  onDownload,
  onSignClick,
  signing,
  canSign,
  bothSigned,
  signaturesSummary,
  signatureUrls,
}: ContractCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "טיוטה":
        return "bg-white text-black border-slate-300";
      case "ממתין לספק":
        return "bg-white text-black border-primary/40";
      case "ממתין ללקוח":
        return "bg-white text-black border-blue-300";
      case "פעיל":
        return "bg-white text-black border-emerald-300";
      case "הושלם":
        return "bg-white text-black border-violet-300";
      case "מבוטל":
        return "bg-white text-black border-rose-300";
      default:
        return "bg-white text-black border-slate-300";
    }
  };

  return (
    <Card className="rounded-xl border border-primary/30 text-slate-700 bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-semibold truncate text-black">
              {contract.eventId.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {contract.supplierId?.user?.name ?? "ספק לא ידוע"}
              </span>
            </div>
          </div>
          <Badge
            className={`${getStatusColor(
              contract.status
            )} border font-medium px-3 py-1 whitespace-nowrap`}
          >
            {contract.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* פרטי אירוע */}
        <div className="rounded-lg border border-primary/30 text-slate-700 p-4 space-y-3 bg-white">
          <div className="flex items-center gap-2 text-sm text-black">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">תאריך אירוע:</span>
            <span className="text-muted-foreground">
              {new Date(contract.eventId.date).toLocaleDateString("he-IL")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-black">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">ספק:</span>
            <span className="text-muted-foreground truncate">
              {contract.supplierId?.user?.email}
            </span>
          </div>
        </div>

        {/* חתימות */}
        <ContractSignaturesSection
          contract={contract}
          isExpanded={isExpanded}
          onToggle={onToggleSignatures}
          signaturesSummary={signaturesSummary}
          signatureUrls={signatureUrls}
        />

        {/* תוכנית תשלומים */}
        {contract.paymentPlan && contract.paymentPlan.length > 0 && (
          <PaymentPlanSection paymentPlan={contract.paymentPlan} />
        )}

        {bothSigned && (
          <div className="border border-primary/30 text-slate-700 rounded-lg p-4 text-center font-medium flex items-center justify-center gap-2 bg-primary/5">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>החוזה חתום על ידי שני הצדדים</span>
          </div>
        )}

        {/* כפתורי פעולה */}
        <div className="flex flex-wrap gap-3 pt-2">
          {contract.s3Key && (
            <Button
              onClick={onDownload}
              className="flex-1 min-w-[150px]"
            >
              <Download className="w-4 h-4 ml-2" />
              צפייה בחוזה
            </Button>
          )}

          {canSign && (
            <Button
              size="sm"
              onClick={onSignClick}
              disabled={signing}
              className="flex-1 min-w-[150px]"
            >
              <PenTool className="w-4 h-4 ml-2" />
              {signing ? "חותם..." : "חתום על החוזה"}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-slate-200">
          <Clock className="w-3 h-3" />
          <span>
            נוצר:{" "}
            {contract.createdAt
              ? new Date(contract.createdAt).toLocaleDateString("he-IL")
              : "-"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

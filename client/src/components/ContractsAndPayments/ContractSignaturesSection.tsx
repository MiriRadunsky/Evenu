
import {
  PenTool,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "../ui/button";
import type { Contract } from "../../types/Contract";

interface SignaturesSummary {
  supplierSigned: boolean;
  clientsCount: number;
}

interface ContractSignaturesSectionProps {
  contract: Contract;
  isExpanded: boolean;
  onToggle: () => void;
  signaturesSummary: SignaturesSummary;
  signatureUrls: Record<string, string>;
}

export function ContractSignaturesSection({
  contract,
  isExpanded,
  onToggle,
  signaturesSummary,
  signatureUrls,
}: ContractSignaturesSectionProps) {
  const { supplierSigned, clientsCount } = signaturesSummary;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold text-sm flex items-center gap-2 text-black">
          <PenTool className="w-4 h-4" />
          סטטוס חתימות
        </h4>

        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={onToggle}
          className="px-0 text-primary"
        >
          {isExpanded ? "הסתר חתימות" : "צפייה בחתימות"}
        </Button>
      </div>

      {/* סיכום קצר */}
      <div className="text-xs text-muted-foreground">
        <span>ספק: {supplierSigned ? "חתם" : "עדיין לא חתם"}</span>
        {" • "}
        <span>
          לקוחות חתומים:{" "}
          {clientsCount > 0 ? clientsCount : "אין עדיין חתימות לקוח"}
        </span>
      </div>

      {/* תוכן נפתח */}
      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-slate-200">
          {/* חתימת ספק */}
          <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 text-slate-700">
            <div className="flex items-center gap-2 mb-3">
              {supplierSigned ? (
                <>
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-black">
                    ספק חתם
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-black">
                    ממתין לחתימת ספק
                  </span>
                </>
              )}
            </div>

            {supplierSigned && contract.supplierSignature && (
              <div className="text-xs space-y-2 pr-7 text-black">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span>
                    {contract.supplierSignature.supplierId?.user?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">
                    {contract.supplierSignature.supplierId?.user?.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>
                    {contract.supplierSignature.at
                      ? new Date(
                          contract.supplierSignature.at
                        ).toLocaleString("he-IL")
                      : "-"}
                  </span>
                </div>
                {contract.supplierSignature.signatureS3Key && (
                  <div className="mt-3 p-2 rounded-lg border border-primary/30 bg-white">
                    <img
                      src={
                        signatureUrls[
                          contract.supplierSignature.signatureS3Key
                        ]
                      }
                      alt="חתימת ספק"
                      className="max-h-16 mx-auto"
                    />
                  </div>
                )}
                {contract.supplierSignature.ipAddress && (
                  <div className="flex items-center gap-2 opacity-70">
                    <MapPin className="w-3 h-3" />
                    <span>IP: {contract.supplierSignature.ipAddress}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* חתימות לקוח/ות */}
          {contract.clientSignatures?.length ? (
            contract.clientSignatures.map((sig, idx) => (
              <div
                key={idx}
                className="border border-primary/30 text-slate-700 rounded-lg p-4 bg-white"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-black">
                    לקוח חתם{" "}
                    {contract.clientSignatures &&
                    contract.clientSignatures.length > 1
                      ? `(${idx + 1})`
                      : ""}
                  </span>
                </div>
                <div className="text-xs space-y-2 pr-7 text-black">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    <span>{sig.clientId?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{sig.clientId?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>
                      {sig.at
                        ? new Date(sig.at).toLocaleString("he-IL")
                        : "-"}
                    </span>
                  </div>
                  {sig.signatureS3Key && (
                    <div className="mt-3 p-2 rounded-lg border border-primary/30 bg-white">
                      <img
                        src={signatureUrls[sig.signatureS3Key]}
                        alt="חתימת לקוח"
                        className="max-h-16 mx-auto"
                      />
                    </div>
                  )}
                  {sig.ipAddress && (
                    <div className="flex items-center gap-2 opacity-70">
                      <MapPin className="w-3 h-3" />
                      <span>IP: {sig.ipAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="border border-primary/30 text-slate-700 rounded-lg bg-primary/5 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-black">
                  ממתין לחתימת לקוח
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

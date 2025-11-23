import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CheckCircle,
  AlertCircle,
  Download,
  PenTool,
} from "lucide-react";
import type { AppDispatch, RootState } from "../../store";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { SignContractDialog } from "../SignContractDialog";
import type { Contract } from "../../types/Contract";
import { getImageUrl, uploadFileToS3 } from "../../services/uploadFile";
import { signContract } from "../../store/contractsSlice";

interface ContactListProps {
  type: "client" | "supplier";
}


export default function ContractList({ type }: ContactListProps) {
  const user = useSelector((state: RootState) => state.auth.user);

  const [signingContractId, setSigningContractId] = useState<string | null>(
    null
  );
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [currentContractToSign, setCurrentContractToSign] = useState<
    string | null
  >(null);
  const [signatureUrls, setSignatureUrls] = useState<Record<string, string>>(
    {}
  );
  const dispatch: AppDispatch = useDispatch();
  const { contracts, loading, error } = useSelector(
    (state: RootState) => state.contracts
  );
  const [selectedTab, setSelectedTab] = useState("הכל");
  useEffect(() => {
    contracts.forEach((contract) => {
      const supplierKey = contract.supplierSignature?.signatureS3Key;
      if (supplierKey && !signatureUrls[supplierKey]) {
        getImageUrl(supplierKey)
          .then((url) =>
            setSignatureUrls((prev) => ({ ...prev, [supplierKey]: url }))
          )
          .catch(console.error);
      }

      contract.clientSignatures?.forEach((sig) => {
        if (sig.signatureS3Key && !signatureUrls[sig.signatureS3Key]) {
          getImageUrl(sig.signatureS3Key)
            .then((url) =>
              setSignatureUrls((prev) => ({
                ...prev,
                [sig.signatureS3Key]: url,
              }))
            )
            .catch(console.error);
        }
      });
    });
  }, [contracts, signatureUrls]);

  const filteredContracts = useMemo(() => {
    if (!contracts) return [];
    const sorted = [...contracts].sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    if (selectedTab === "הכל") return sorted;

    return sorted.filter((r) => r.status === selectedTab);
  }, [contracts, selectedTab]);

  const convertBase64ToBlob = (signatureData: string) => {
    const base64 = signatureData.replace(/^data:image\/png;base64,/, "");
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const blob = new Blob([new Uint8Array(byteNumbers)], {
      type: "image/png",
    });
    const signatureKey = `signature-${user?._id}-${Date.now()}.png`;
    const file = new File([blob], signatureKey, { type: "image/png" });
    return { file, signatureKey };
  };
  const handleSignatureSubmit = async (signatureData: string) => {
    if (!currentContractToSign || !user?._id) return;

    try {
      setSigningContractId(currentContractToSign);
      const { file, signatureKey } = convertBase64ToBlob(signatureData);
      await uploadFileToS3(file);
      dispatch(
        signContract({
          party: type,
          contractId: currentContractToSign,
          userId: user._id,
          signatureKey: signatureKey,
        })
      );
      alert("החוזה חתום בהצלחה!");
      setSignDialogOpen(false);
      setCurrentContractToSign(null);
    } catch (err: unknown) {
      const signError = err as { response?: { data?: { message?: string } } };
      console.error("❌ Error signing contract:", signError);
      alert(error || "שגיאה בחתימת החוזה");
    } finally {
      setSigningContractId(null);
    }
  };
  const handleSignContract = (contractId: string) => {
    setSignDialogOpen(true);
    setCurrentContractToSign(contractId);
  };
  const handleDownloadContract = async (contractId: string) => {
    try {
      const contract = contracts.find((c) => c._id === contractId);
      if (!contract?.s3Key) return alert("אין קובץ חוזה");
      const url = await getImageUrl(contract.s3Key);
      window.open(url, "_blank");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "שגיאה בהורדת החוזה");
    }
  };

  const isClientSigned = (contract: Contract) =>
    // contract.clientSignatures?.some((sig) => sig.clientId?._id === user?._id);
    contract.clientSignatures!=undefined
  

  const getStatusColor = (status: string) => {
    switch (status) {
      case "טיוטה":
        return "bg-gray-100 text-gray-800";
      case "ממתין לספק":
        return "bg-yellow-100 text-yellow-800";
      case "ממתין ללקוח":
        return "bg-blue-100 text-blue-800";
      case "פעיל":
        return "bg-green-100 text-green-800";
      case "הושלם":
        return "bg-purple-100 text-purple-800";
      case "מבוטל":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <h1 className="text-3xl font-bold">החוזים שלי</h1>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="הכל">הכל</TabsTrigger>
          <TabsTrigger value="מבוטל">מבוטל</TabsTrigger>
          <TabsTrigger value="טיוטה">טיוטה</TabsTrigger>
          <TabsTrigger value="פעיל">פעיל</TabsTrigger>
          <TabsTrigger value="ממתין ללקוח">ממתין ללקוח</TabsTrigger>
          <TabsTrigger value="ממתין לספק">ממתין לספק</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {error && (
            <div className="bg-red-50 p-4 rounded-lg text-red-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
          {loading && <p>טוען חוזים...</p>}
          {filteredContracts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                אין חוזים
              </CardContent>
            </Card>
          ) : (
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContracts.map((contract) => {
                // const isClientSignedByMe = isClientSigned(contract);
                const isClientSignedByMe = isClientSigned(contract);
                const isSupplierSigned = !!contract.supplierSignature;
                const bothSigned = isClientSignedByMe && isSupplierSigned;

                return (
                  <Card
                    key={contract._id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {contract.eventId.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            עם: {contract.supplierId?.user.name}
                          </p>
                        </div>
                        <Badge className={getStatusColor(contract.status)}>
                          {contract.status}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Event Details */}
                      <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                        <p>
                          <span className="font-semibold">תאריך אירוע: </span>
                          {new Date(contract.eventId.date).toLocaleDateString(
                            "he-IL"
                          )}
                        </p>
                        <p>
                          <span className="font-semibold">ספק: </span>
                          {contract.supplierId?.user.email}
                        </p>
                      </div>

                      {/* Signature Status */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">סטטוס חתימות:</h4>

                        {/* Supplier Signature */}
                        <div className="bg-muted p-3 rounded-lg space-y-1">
                          <div className="flex items-center gap-2">
                            {isSupplierSigned ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600" />{" "}
                                :
                                <span className="text-sm font-medium">
                                  ספק חתם
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm font-medium">
                                  ספק לא חתם
                                </span>
                              </>
                            )}
                          </div>
                          {isSupplierSigned && contract.supplierSignature && (
                            <div className="text-xs text-muted-foreground mt-2 space-y-2 pl-6">
                              <p>
                                📝{" "}
                                {
                                  contract.supplierSignature.supplierId?.user
                                    .name
                                }
                              </p>
                              <p>
                                📧{" "}
                                {
                                  contract.supplierSignature.supplierId?.user
                                    .email
                                }
                              </p>
                              <p>
                                🕐{" "}
                                {new Date(
                                  contract.supplierSignature.at
                                ).toLocaleString("he-IL")}
                              </p>
                              {contract.supplierSignature.signatureS3Key && (
                                <img
                                  src={
                                    signatureUrls[
                                      contract.supplierSignature.signatureS3Key
                                    ]
                                  }
                                  alt="חתימת ספק"
                                  className="border rounded max-h-20 bg-white cursor-pointer"
                                />
                              )}
                              {contract.supplierSignature.ipAddress && (
                                <p className="text-xs opacity-60">
                                  IP: {contract.supplierSignature.ipAddress}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Client Signatures */}
                        {contract.clientSignatures?.map((sig, idx) => (
                          <div
                            key={idx}
                            className="bg-muted p-3 rounded-lg space-y-1"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium">
                                קליינט חתם{" "}
                                {contract.clientSignatures!.length > 1
                                  ? `(${idx + 1})`
                                  : ""}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2 space-y-2 pl-6">
                              <p>📝 {sig.clientId?.name}</p>
                              <p>📧 {sig.clientId?.email}</p>
                              <p>
                                🕐 {new Date(sig.at).toLocaleString("he-IL")}
                              </p>
                              {sig.signatureS3Key && (
                                <img
                                  src={signatureUrls[sig.signatureS3Key]}
                                  alt="חתימת קליינט"
                                  className="border rounded max-h-20 bg-white cursor-pointer"
                                />
                              )}
                              {sig.ipAddress && (
                                <p className="text-xs opacity-60">
                                  IP: {sig.ipAddress}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}

                        {!contract.clientSignatures?.length && (
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm">
                                אף קליינט לא חתם עדיין
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Payment Plan */}
                      {/* {contract.paymentPlan?.length > 0 && (
                <div className="bg-muted p-3 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">תוכנית תשלומים</h4>
                  <div className="space-y-1 text-sm">
                    {contract.paymentPlan.map((payment, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span>{new Date(payment.dueDate).toLocaleDateString("he-IL")}</span>
                        <span className="font-medium">₪{payment.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}

                      {bothSigned && (
                        <Badge className="w-full justify-center bg-green-100 text-green-800">
                          החוזה חתום על ידי שני הצדדים ✓
                        </Badge>
                      )}

<div className="flex flex-wrap gap-2 pt-2">
                        {contract.s3Key && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadContract(contract._id)}
                            className="flex-1"
                          >
                            <Download className="w-4 h-4 ml-2" /> הורד חוזה
                          </Button>
                        )}

                        {type === "client" && !contract.clientSignatures?.length && (
                          <Button
                            size="sm"
                            onClick={() => handleSignContract(contract._id)}
                            disabled={signingContractId === contract._id}
                            className="flex-1"
                          >
                            <PenTool className="w-4 h-4 ml-2" />{" "}
                            {signingContractId === contract._id
                              ? "חותם..."
                              : "חתום על החוזה"}
                          </Button>
                        )}
                        {type === "supplier" && !isSupplierSigned && (
                          <Button
                            size="sm"
                            onClick={() => handleSignContract(contract._id)}
                            disabled={signingContractId === contract._id}
                            className="flex-1"
                          >
                            <PenTool className="w-4 h-4 ml-2" />{" "}
                            {signingContractId === contract._id
                              ? "חותם..."
                              : "חתום על החוזה"}
                          </Button>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        נוצר:{" "}
                        {new Date(contract.createdAt).toLocaleDateString(
                          "he-IL"
                        )}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          <SignContractDialog
            open={signDialogOpen}
            onOpenChange={setSignDialogOpen}
            onSign={handleSignatureSubmit}
            isLoading={signingContractId !== null}
            contractName={
              contracts.find((c) => c._id === currentContractToSign)?.eventId
                ?.name || "החוזה"
            }
          />
          );
        </TabsContent>
      </Tabs>
    </div>
  );
}

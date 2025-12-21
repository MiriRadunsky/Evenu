import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Calendar,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import type { AppDispatch, RootState } from "../../store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import type { Contract } from "../../types/Contract";
import { getImageUrl, uploadFileToS3 } from "../../services/uploadFile";
import {
  signContract,
  fetchContractsBySupplier,
  fetchContractsByClient,
  cancelContract,
} from "../../store/contractsSlice";
import { SignContractDialog } from "./SignContractDialog";
import { ContractCard } from "./ContractCard";
import { fetchRelevantEvents } from "../../store/eventsSlice";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

interface ContractListProps {
  type: "client" | "supplier";
}

export default function ContractList({ type }: ContractListProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch: AppDispatch = useDispatch();

  const { data, loading, error } = useSelector(
    (state: RootState) => state.contracts
  );

  const { contracts ,total,totalPages} = useMemo(() => {
    return {contracts:data?.items ?? [],total: data?.total ?? 0,totalPages: data?.totalPages ?? 1};
  }, [data]);
  
  const events = useSelector((state: RootState) => state.events.eventsList);

  const [selectedTab, setSelectedTab] = useState("הכל");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEventId, setSelectedEventId] = useState<string>("all");

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
  const [searchTerm, setSearchTerm] = useState("");

  const [expandedSignaturesId, setExpandedSignaturesId] = useState<
    string | null
  >(null);
const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const toggleSignatures = (contractId: string) => {
    setExpandedSignaturesId((prev) =>
      prev === contractId ? null : contractId
    );
  };

  // Add filtering logic for relevant events
  useEffect(() => {
    if (type === "client") {
      dispatch(fetchRelevantEvents()); // Fetch only relevant events
    }
  }, [type, dispatch]);

  const filteredEvents = events.filter((event) => event.isRelevant);

  useEffect(() => {
    const statusFilter = selectedTab === "הכל" ? undefined : selectedTab;
    const eventIdFilter =
      selectedEventId === "all" ? undefined : selectedEventId;

    const query = {
      page: currentPage,
      status: statusFilter,
      debouncedSearch,
    };

    if (type === "supplier") {
      dispatch(fetchContractsBySupplier(query));
    } else {
      dispatch(
        fetchContractsByClient({
          ...query,
          eventId: eventIdFilter,
        })
      );
    }
  }, [dispatch, type, selectedTab, currentPage, selectedEventId, debouncedSearch]);
const handleCancelContract = async (contractId: string) => {
  try {
    const ok = window.confirm("בטוחה שתרצי לבטל את החוזה? לא ניתן לשחזר.");
    if (!ok) return;

    await dispatch(
      cancelContract({
        party: type,          
        contractId,
      })
    ).unwrap();

    toast.success("החוזה בוטל בהצלחה");
  } catch (err: unknown) {
    toast.error(String(err));
  }
};



  useEffect(() => {
    if (!contracts.length) return;

    (async () => {
      for (const contract of contracts) {
        const supplierKey = contract.supplierSignature?.signatureS3Key;
        if (supplierKey && !signatureUrls[supplierKey]) {
          try {
            const url = await getImageUrl(supplierKey);
            setSignatureUrls((prev) =>
              prev[supplierKey] ? prev : { ...prev, [supplierKey]: url }
            );
          } catch (e) {
            console.error(e);
          }
        }

        if (contract.clientSignatures?.length) {
          for (const sig of contract.clientSignatures) {
            if (sig.signatureS3Key && !signatureUrls[sig.signatureS3Key]) {
              try {
                const url = await getImageUrl(sig.signatureS3Key);
                setSignatureUrls((prev) =>
                  prev[sig.signatureS3Key]
                    ? prev
                    : { ...prev, [sig.signatureS3Key]: url }
                );
              } catch (e) {
                console.error(e);
              }
            }
          }
        }
      }
    })();
  }, [contracts, signatureUrls]);

  

  const isClientSignedByCurrentUser = (contract: Contract) => {
    if (!user?._id) return false;
    return (
      contract.clientSignatures?.some(
        (sig) => String(sig.clientId?._id || sig.clientId) === String(user._id)
      ) ?? false
    );
  };

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
      const { file } = convertBase64ToBlob(signatureData);
      const returnedSignatureKey = await uploadFileToS3(file);

      await dispatch(
        signContract({
          party: type,
          contractId: currentContractToSign,
          userId: user._id,
          signatureKey: returnedSignatureKey,
        })
      ).unwrap();

      toast.success("החוזה נחתם בהצלחה");
      setSignDialogOpen(false);
      setCurrentContractToSign(null);
    } catch (err: unknown) {
      console.error(err);
      const errorText = String(err);
      toast.error(errorText);
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
      if (!contract?.s3Key) {
        toast.error("אין קובץ חוזה להורדה");
        return;
      }
      const url = await getImageUrl(contract.s3Key);
      window.open(url, "_blank");
    } catch (err: unknown) {
      const errorText = String(err);
      toast.error(errorText);
    }
  };

  const handleChangePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setCurrentPage(nextPage);
  };

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-black">החוזים שלי</h1>
        </div>
      </div>

      <div className="text-sm text-muted-foreground text-left">
        סך הכל {total} חוזים
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
                setCurrentPage(1);
              }}
              className="w-full border border-primary/40 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ direction: "rtl" }}
            />
          </div>

          {type === "client" && (
            <div className="w-full md:w-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
              <div className="space-y-1 text-right md:text-left">
                <p className="text-sm font-semibold">סינון</p>
                <p className="text-xs text-muted-foreground">
                  אפשר לראות חוזים לפי אירוע
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
                    {filteredEvents?.map((ev) => (
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
          setSelectedTab(value);
          setCurrentPage(1);
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-7 h-auto">
          <TabsTrigger value="הכל">הכל</TabsTrigger>
          <TabsTrigger value="פעיל">פעיל</TabsTrigger>
          <TabsTrigger value="ממתין ללקוח">ממתין ללקוח</TabsTrigger>
          <TabsTrigger value="ממתין לספק">ממתין לספק</TabsTrigger>
          <TabsTrigger value="טיוטה">טיוטה</TabsTrigger>
          <TabsTrigger value="מבוטל">מבוטל</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-800 flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && contracts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">
                  אין חוזים להצגה
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  החוזים שלך יופיעו כאן כאשר יווצרו
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                    <p className="text-muted-foreground">טוען חוזים...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {contracts.map((contract) => {
                    const isSupplierSigned = !!contract.supplierSignature;
                    const clientSignedByMe =
                      isClientSignedByCurrentUser(contract);
                    const bothSigned = isSupplierSigned && clientSignedByMe;

                    const canClientSign = !!(
                      type === "client" &&
                      user?._id &&
                      !clientSignedByMe &&
                      contract.status !== "מבוטל"
                    );

                    const canSupplierSign = !!(
                      type === "supplier" &&
                      user?._id &&
                      !isSupplierSigned &&
                      contract.status !== "מבוטל"
                    );

                    const canSign = canClientSign || canSupplierSign;

                    const clientSignaturesCount =
                      contract.clientSignatures?.length || 0;

                    return (
                      <ContractCard
                        key={contract._id}
                        contract={contract}
                        isExpanded={expandedSignaturesId === contract._id}
                        onToggleSignatures={() =>
                          toggleSignatures(contract._id)
                        }
                        onDownload={() => handleDownloadContract(contract._id)}
                        onSignClick={() => handleSignContract(contract._id)}
                        signing={signingContractId === contract._id}
                          onCancel={() => handleCancelContract(contract._id)}  
                        canSign={canSign}
                        bothSigned={bothSigned}
                        signaturesSummary={{
                          supplierSigned: isSupplierSigned,
                          clientsCount: clientSignaturesCount,
                        }}
                        signatureUrls={signatureUrls}
                      />
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChangePage(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  >
                    <ChevronRight className="w-4 h-4 ml-1" />
                    הקודם
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    עמוד {currentPage} מתוך {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChangePage(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                  >
                    הבא
                    <ChevronLeft className="w-4 h-4 mr-1" />
                  </Button>
                </div>
              )}
            </>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

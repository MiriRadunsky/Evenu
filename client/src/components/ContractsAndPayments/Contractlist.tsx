// import { useEffect, useMemo, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { CheckCircle, AlertCircle, Download, PenTool } from "lucide-react";
// import type { AppDispatch, RootState } from "../../store";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
// import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import { Badge } from "../ui/badge";
// import { Button } from "../ui/button";
// import { SignContractDialog } from "../SignContractDialog";
// import type { Contract } from "../../types/Contract";
// import { getImageUrl, uploadFileToS3 } from "../../services/uploadFile";
// import { signContract } from "../../store/contractsSlice";

// interface ContactListProps {
//   type: "client" | "supplier";
// }

// export default function ContractList({ type }: ContactListProps) {
//   const user = useSelector((state: RootState) => state.auth.user);

//   const [signingContractId, setSigningContractId] = useState<string | null>(
//     null
//   );
//   const [signDialogOpen, setSignDialogOpen] = useState(false);
//   const [currentContractToSign, setCurrentContractToSign] = useState<
//     string | null
//   >(null);
//   const [signatureUrls, setSignatureUrls] = useState<Record<string, string>>(
//     {}
//   );
//   const dispatch: AppDispatch = useDispatch();
//   const { contracts, loading, error } = useSelector(
//     (state: RootState) => state.contracts
//   );
//   const [selectedTab, setSelectedTab] = useState("הכל");
//   useEffect(() => {
//     contracts.forEach((contract) => {
//       const supplierKey = contract.supplierSignature?.signatureS3Key;
//       if (supplierKey && !signatureUrls[supplierKey]) {
//         getImageUrl(supplierKey)
//           .then((url) =>
//             setSignatureUrls((prev) => ({ ...prev, [supplierKey]: url }))
//           )
//           .catch(console.error);
//       }

//       contract.clientSignatures?.forEach((sig) => {
//         if (sig.signatureS3Key && !signatureUrls[sig.signatureS3Key]) {
//           getImageUrl(sig.signatureS3Key)
//             .then((url) =>
//               setSignatureUrls((prev) => ({
//                 ...prev,
//                 [sig.signatureS3Key]: url,
//               }))
//             )
//             .catch(console.error);
//         }
//       });
//     });
//   }, [contracts, signatureUrls]);

//   const filteredContracts = useMemo(() => {
//     if (!contracts) return [];
//     const sorted = [...contracts].sort((a, b) => {
//       if (!a.createdAt) return 1;
//       if (!b.createdAt) return -1;
//       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
//     });

//     if (selectedTab === "הכל") return sorted;

//     return sorted.filter((r) => r.status === selectedTab);
//   }, [contracts, selectedTab]);

//   const convertBase64ToBlob = (signatureData: string) => {
//     const base64 = signatureData.replace(/^data:image\/png;base64,/, "");
//     const byteCharacters = atob(base64);
//     const byteNumbers = new Array(byteCharacters.length);

//     for (let i = 0; i < byteCharacters.length; i++) {
//       byteNumbers[i] = byteCharacters.charCodeAt(i);
//     }

//     const blob = new Blob([new Uint8Array(byteNumbers)], {
//       type: "image/png",
//     });
//     const signatureKey = `signature-${user?._id}-${Date.now()}.png`;
//     const file = new File([blob], signatureKey, { type: "image/png" });
//     return { file, signatureKey };
//   };
//   const handleSignatureSubmit = async (signatureData: string) => {
//     if (!currentContractToSign || !user?._id) return;

//     try {
//       setSigningContractId(currentContractToSign);
//       const { file, signatureKey } = convertBase64ToBlob(signatureData);
//       await uploadFileToS3(file);
//       dispatch(
//         signContract({
//           party: type,
//           contractId: currentContractToSign,
//           userId: user._id,
//           signatureKey: signatureKey,
//         })
//       );
//       alert("החוזה חתום בהצלחה!");
//       setSignDialogOpen(false);
//       setCurrentContractToSign(null);
//     } catch (err: unknown) {
//       const signError = err as { response?: { data?: { message?: string } } };
//       console.error("❌ Error signing contract:", signError);
//       alert(error || "שגיאה בחתימת החוזה");
//     } finally {
//       setSigningContractId(null);
//     }
//   };
//   const handleSignContract = (contractId: string) => {
//     setSignDialogOpen(true);
//     setCurrentContractToSign(contractId);
//   };
//   const handleDownloadContract = async (contractId: string) => {
//     try {
//       const contract = contracts.find((c) => c._id === contractId);
//       if (!contract?.s3Key) return alert("אין קובץ חוזה");
//       const url = await getImageUrl(contract.s3Key);
//       window.open(url, "_blank");
//     } catch (err: unknown) {
//       const error = err as { response?: { data?: { message?: string } } };
//       alert(error.response?.data?.message || "שגיאה בהורדת החוזה");
//     }
//   };

//   const isClientSigned = (contract: Contract) =>
//     // contract.clientSignatures?.some((sig) => sig.clientId?._id === user?._id);
//     contract.clientSignatures != undefined;

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "טיוטה":
//         return "bg-gray-100 text-gray-800";
//       case "ממתין לספק":
//         return "bg-yellow-100 text-yellow-800";
//       case "ממתין ללקוח":
//         return "bg-blue-100 text-blue-800";
//       case "פעיל":
//         return "bg-green-100 text-green-800";
//       case "הושלם":
//         return "bg-purple-100 text-purple-800";
//       case "מבוטל":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   return (
//     <div className="space-y-6" style={{ direction: "rtl" }}>
//       <h1 className="text-3xl font-bold">החוזים שלי</h1>
//       <Tabs value={selectedTab} onValueChange={setSelectedTab}>
//         <TabsList>
//           <TabsTrigger value="הכל">הכל</TabsTrigger>
//           <TabsTrigger value="מבוטל">מבוטל</TabsTrigger>
//           <TabsTrigger value="טיוטה">טיוטה</TabsTrigger>
//           <TabsTrigger value="פעיל">פעיל</TabsTrigger>
//           <TabsTrigger value="ממתין ללקוח">ממתין ללקוח</TabsTrigger>
//           <TabsTrigger value="ממתין לספק">ממתין לספק</TabsTrigger>
//         </TabsList>

//         <TabsContent value={selectedTab} className="mt-6">
//           {error && (
//             <div className="bg-red-50 p-4 rounded-lg text-red-800 flex items-center gap-2">
//               <AlertCircle className="w-5 h-5" />
//               {error}
//             </div>
//           )}
//           {loading && <p>טוען חוזים...</p>}
//           {filteredContracts.length === 0 ? (
//             <Card>
//               <CardContent className="py-8 text-center text-muted-foreground">
//                 אין חוזים
//               </CardContent>
//             </Card>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {filteredContracts.map((contract) => {
//                 console.log("filteredContracts", filteredContracts);

//                 // const isClientSignedByMe = isClientSigned(contract);
//                 const isClientSignedByMe = isClientSigned(contract);
//                 const isSupplierSigned = !!contract.supplierSignature;
//                 const bothSigned = isClientSignedByMe && isSupplierSigned;

//                 return (
//                   <Card
//                     key={contract._id}
//                     className="hover:shadow-lg transition-shadow"
//                   >
//                     <CardHeader>
//                       <div className="flex items-start justify-between">
//                         <div>
//                           <CardTitle className="text-lg">
//                             {contract.eventId.name}
//                           </CardTitle>
//                           <p className="text-sm text-muted-foreground mt-1">
//                             עם: {contract.supplierId?.user.name}
//                           </p>
//                         </div>
//                         <Badge className={getStatusColor(contract.status)}>
//                           {contract.status}
//                         </Badge>
//                       </div>
//                     </CardHeader>

//                     <CardContent className="space-y-4">
//                       {/* Event Details */}
//                       <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
//                         <p>
//                           <span className="font-semibold">תאריך אירוע: </span>
//                           {new Date(contract.eventId.date).toLocaleDateString(
//                             "he-IL"
//                           )}
//                         </p>
//                         <p>
//                           <span className="font-semibold">ספק: </span>
//                           {contract.supplierId?.user.email}
//                         </p>
//                       </div>

//                       {/* Signature Status */}
//                       <div className="space-y-3">
//                         <h4 className="font-semibold text-sm">סטטוס חתימות:</h4>

//                         {/* Supplier Signature */}
//                         <div className="bg-muted p-3 rounded-lg space-y-1">
//                           <div className="flex items-center gap-2">
//                             {isSupplierSigned ? (
//                               <>
//                                 <CheckCircle className="w-4 h-4 text-green-600" />{" "}
//                                 :
//                                 <span className="text-sm font-medium">
//                                   ספק חתם
//                                 </span>
//                               </>
//                             ) : (
//                               <>
//                                 <AlertCircle className="w-4 h-4 text-yellow-600" />
//                                 <span className="text-sm font-medium">
//                                   ספק לא חתם
//                                 </span>
//                               </>
//                             )}
//                           </div>
//                           {isSupplierSigned && contract.supplierSignature && (
//                             <div className="text-xs text-muted-foreground mt-2 space-y-2 pl-6">
//                               <p>
//                                 📝{" "}
//                                 {
//                                   contract.supplierSignature.supplierId?.user
//                                     .name
//                                 }
//                               </p>
//                               <p>
//                                 📧{" "}
//                                 {
//                                   contract.supplierSignature.supplierId?.user
//                                     .email
//                                 }
//                               </p>
//                               <p>
//                                 🕐{" "}
//                                 {new Date(
//                                   contract.supplierSignature.at
//                                 ).toLocaleString("he-IL")}
//                               </p>
//                               {contract.supplierSignature.signatureS3Key && (
//                                 <img
//                                   src={
//                                     signatureUrls[
//                                       contract.supplierSignature.signatureS3Key
//                                     ]
//                                   }
//                                   alt="חתימת ספק"
//                                   className="border rounded max-h-20 bg-white cursor-pointer"
//                                 />
//                               )}
//                               {contract.supplierSignature.ipAddress && (
//                                 <p className="text-xs opacity-60">
//                                   IP: {contract.supplierSignature.ipAddress}
//                                 </p>
//                               )}
//                             </div>
//                           )}
//                         </div>

//                         {/* Client Signatures */}
//                         {contract.clientSignatures?.map((sig, idx) => (
//                           <div
//                             key={idx}
//                             className="bg-muted p-3 rounded-lg space-y-1"
//                           >
//                             <div className="flex items-center gap-2">
//                               <CheckCircle className="w-4 h-4 text-green-600" />
//                               <span className="text-sm font-medium">
//                                 קליינט חתם{" "}
//                                 {contract.clientSignatures!.length > 1
//                                   ? `(${idx + 1})`
//                                   : ""}
//                               </span>
//                             </div>
//                             <div className="text-xs text-muted-foreground mt-2 space-y-2 pl-6">
//                               <p>📝 {sig.clientId?.name}</p>
//                               <p>📧 {sig.clientId?.email}</p>
//                               <p>
//                                 🕐 {new Date(sig.at).toLocaleString("he-IL")}
//                               </p>
//                               {sig.signatureS3Key && (
//                                 <img
//                                   src={signatureUrls[sig.signatureS3Key]}
//                                   alt="חתימת קליינט"
//                                   className="border rounded max-h-20 bg-white cursor-pointer"
//                                 />
//                               )}
//                               {sig.ipAddress && (
//                                 <p className="text-xs opacity-60">
//                                   IP: {sig.ipAddress}
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                         ))}

//                         {!contract.clientSignatures?.length && (
//                           <div className="bg-muted p-3 rounded-lg">
//                             <div className="flex items-center gap-2">
//                               <AlertCircle className="w-4 h-4 text-yellow-600" />
//                               <span className="text-sm">
//                                 אף קליינט לא חתם עדיין
//                               </span>
//                             </div>
//                           </div>
//                         )}
//                       </div>

//                       {/* Payment Plan */}
//                       {contract.paymentPlan.length > 0 && (
//                         <div className="bg-muted p-3 rounded-lg">
//                           <h4 className="font-semibold text-sm mb-2">
//                             תוכנית תשלומים
//                           </h4>
//                           <div className="space-y-1 text-sm">
//                             {contract.paymentPlan.map((payment, idx) => (
//                               <div
//                                 key={idx}
//                                 className="flex justify-between items-center"
//                               >
//                                 <span>
//                                   {new Date(payment.dueDate).toLocaleDateString(
//                                     "he-IL"
//                                   )}
//                                 </span>
//                                 <span className="font-medium">
//                                   ₪{payment.amount.toLocaleString()}
//                                 </span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}

//                       {bothSigned && (
//                         <Badge className="w-full justify-center bg-green-100 text-green-800">
//                           החוזה חתום על ידי שני הצדדים ✓
//                         </Badge>
//                       )}

//                       <div className="flex flex-wrap gap-2 pt-2">
//                         {contract.s3Key && (
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => handleDownloadContract(contract._id)}
//                             className="flex-1"
//                           >
//                             <Download className="w-4 h-4 ml-2" /> צפיה חוזה
//                           </Button>
//                         )}

//                         {type === "client" &&
//                           !contract.clientSignatures?.length && (
//                             <Button
//                               size="sm"
//                               onClick={() => handleSignContract(contract._id)}
//                               disabled={signingContractId === contract._id}
//                               className="flex-1"
//                             >
//                               <PenTool className="w-4 h-4 ml-2" />{" "}
//                               {signingContractId === contract._id
//                                 ? "חותם..."
//                                 : "חתום על החוזה"}
//                             </Button>
//                           )}
//                         {type === "supplier" && !isSupplierSigned && (
//                           <Button
//                             size="sm"
//                             onClick={() => handleSignContract(contract._id)}
//                             disabled={signingContractId === contract._id}
//                             className="flex-1"
//                           >
//                             <PenTool className="w-4 h-4 ml-2" />{" "}
//                             {signingContractId === contract._id
//                               ? "חותם..."
//                               : "חתום על החוזה"}
//                           </Button>
//                         )}
//                       </div>

//                       <p className="text-xs text-muted-foreground">
//                         נוצר:{" "}
//                         {new Date(contract.createdAt).toLocaleDateString(
//                           "he-IL"
//                         )}
//                       </p>
//                     </CardContent>
//                   </Card>
//                 );
//               })}
//             </div>
//           )}
//           <SignContractDialog
//             open={signDialogOpen}
//             onOpenChange={setSignDialogOpen}
//             onSign={handleSignatureSubmit}
//             isLoading={signingContractId !== null}
//             contractName={
//               contracts.find((c) => c._id === currentContractToSign)?.eventId
//                 ?.name || "החוזה"
//             }
//           />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CheckCircle, AlertCircle, Download, PenTool, Calendar, Mail, User, Clock, MapPin } from "lucide-react";
import type { AppDispatch, RootState } from "../../store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { Contract } from "../../types/Contract";
import { getImageUrl, uploadFileToS3 } from "../../services/uploadFile";
import { signContract } from "../../store/contractsSlice";
import { SignContractDialog } from "./SignContractDialog";

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
    contract.clientSignatures != undefined&&contract.clientSignatures!.length > 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "טיוטה":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "ממתין לספק":
        return "bg-yellow-50 text-yellow-700 border-yellow-300";
      case "ממתין ללקוח":
        return "bg-blue-50 text-blue-700 border-blue-300";
      case "פעיל":
        return "bg-green-50 text-green-700 border-green-300";
      case "הושלם":
        return "bg-purple-50 text-purple-700 border-purple-300";
      case "מבוטל":
        return "bg-red-50 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          החוזים שלי
        </h1>
        <div className="text-sm text-muted-foreground">
          סך הכל {filteredContracts.length} חוזים
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="הכל">
            הכל
          </TabsTrigger>
          <TabsTrigger value="פעיל">
            פעיל
          </TabsTrigger>
          <TabsTrigger value="ממתין ללקוח">
            ממתין ללקוח
          </TabsTrigger>
          <TabsTrigger value="ממתין לספק">
            ממתין לספק
          </TabsTrigger>
          <TabsTrigger value="טיוטה" >
            טיוטה
          </TabsTrigger>
          <TabsTrigger value="מבוטל" >
            מבוטל
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-800 flex items-center gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">טוען חוזים...</p>
              </div>
            </div>
          )}
          
          {!loading && filteredContracts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">אין חוזים להצגה</p>
                <p className="text-sm text-muted-foreground mt-1">החוזים שלך יופיעו כאן</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredContracts.map((contract) => {
                const isClientSignedByMe = isClientSigned(contract);
                const isSupplierSigned = !!contract.supplierSignature;
                console.log(isClientSignedByMe, isSupplierSigned);
                
                const bothSigned = isClientSignedByMe && isSupplierSigned;

                return (
                  <Card
                    key={contract._id}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl font-bold truncate">
                            {contract.eventId.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{contract.supplierId?.user.name}</span>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(contract.status)} border font-medium px-3 py-1 whitespace-nowrap`}>
                          {contract.status}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-5">
                      {/* Event Details */}
                      <div className="bg-gradient-to-br from-muted/50 to-muted p-4 rounded-xl space-y-3 border">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="font-semibold">תאריך אירוע:</span>
                          <span className="text-muted-foreground">
                            {new Date(contract.eventId.date).toLocaleDateString("he-IL")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="font-semibold">ספק:</span>
                          <span className="text-muted-foreground truncate">
                            {contract.supplierId?.user.email}
                          </span>
                        </div>
                      </div>

                      {/* Signature Status */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-sm flex items-center gap-2">
                          <PenTool className="w-4 h-4" />
                          סטטוס חתימות
                        </h4>

                        {/* Supplier Signature */}
                        <div className={`p-4 rounded-xl border-2 transition-colors ${
                          isSupplierSigned 
                            ? "bg-green-50 border-green-200" 
                            : "bg-yellow-50 border-yellow-200"
                        }`}>
                          <div className="flex items-center gap-2 mb-3">
                            {isSupplierSigned ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm font-semibold text-green-700">
                                  ספק חתם
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                <span className="text-sm font-semibold text-yellow-700">
                                  ממתין לחתימת ספק
                                </span>
                              </>
                            )}
                          </div>
                          {isSupplierSigned && contract.supplierSignature && (
                            <div className="text-xs space-y-2 pr-7 text-green-800">
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3" />
                                <span>{contract.supplierSignature.supplierId?.user.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                <span className="truncate">{contract.supplierSignature.supplierId?.user.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(contract.supplierSignature.at).toLocaleString("he-IL")}</span>
                              </div>
                              {contract.supplierSignature.signatureS3Key && (
                                <div className="mt-3 p-2 bg-white rounded-lg border-2 border-green-200">
                                  <img
                                    src={signatureUrls[contract.supplierSignature.signatureS3Key]}
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

                        {/* Client Signatures */}
                        {contract.clientSignatures?.map((sig, idx) => (
                          <div
                            key={idx}
                            className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                              <span className="text-sm font-semibold text-blue-700">
                                לקוח חתם {contract.clientSignatures!.length > 1 ? `(${idx + 1})` : ""}
                              </span>
                            </div>
                            <div className="text-xs space-y-2 pr-7 text-blue-800">
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
                                <span>{new Date(sig.at).toLocaleString("he-IL")}</span>
                              </div>
                              {sig.signatureS3Key && (
                                <div className="mt-3 p-2 bg-white rounded-lg border-2 border-blue-200">
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
                        ))}

                        {!contract.clientSignatures?.length && (
                          <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                              <span className="text-sm font-semibold text-yellow-700">
                                ממתין לחתימת לקוח
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Payment Plan */}
                      {contract.paymentPlan.length > 0 && (
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 p-4 rounded-xl">
                          <h4 className="font-bold text-sm mb-3 text-purple-900">תוכנית תשלומים</h4>
                          <div className="space-y-2">
                            {contract.paymentPlan.map((payment, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center bg-white p-3 rounded-lg border border-purple-200 text-sm"
                              >
                                <span className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(payment.dueDate).toLocaleDateString("he-IL")}
                                </span>
                                <span className="font-bold text-purple-900">
                                  ₪{payment.amount.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {bothSigned && (
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl text-center font-semibold shadow-lg">
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            <span>החוזה חתום על ידי שני הצדדים</span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 pt-2">
                        {contract.s3Key && (
                          <Button
                            onClick={() => handleDownloadContract(contract._id)}
                            className="flex-1 min-w-[150px] "
                          >
                            <Download className="w-4 h-4 ml-2" />
                            צפייה בחוזה
                          </Button>
                        )}

                        {type === "client" && !contract.clientSignatures?.length && (
                          <Button
                            size="sm"
                            onClick={() => handleSignContract(contract._id)}
                            disabled={signingContractId === contract._id}
                            className="flex-1 min-w-[150px] shadow-md"
                          >
                            <PenTool className="w-4 h-4 ml-2" />
                            {signingContractId === contract._id ? "חותם..." : "חתום על החוזה"}
                          </Button>
                        )}
                        
                        {type === "supplier" && !isSupplierSigned && (
                          <Button
                            size="sm"
                            onClick={() => handleSignContract(contract._id)}
                            disabled={signingContractId === contract._id}
                            className="flex-1 min-w-[150px] shadow-md"
                          >
                            <PenTool className="w-4 h-4 ml-2" />
                            {signingContractId === contract._id ? "חותם..." : "חתום על החוזה"}
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                        <Clock className="w-3 h-3" />
                        <span>נוצר: {new Date(contract.createdAt).toLocaleDateString("he-IL")}</span>
                      </div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
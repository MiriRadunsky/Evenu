import { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  approveRequest,
  declineRequest,
  SetSelectedSupplierRequest,
} from "../../store/requestSlice";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Upload,
} from "lucide-react";
import type { AppDispatch, RootState } from "../../store";
import { CreateContractDialog } from "../supplier/CreateContractDialog";

interface RequestListProps {
  type: "client" | "supplier";
}

export default function RequestList({ type }: RequestListProps) {
  const dispatch: AppDispatch = useDispatch();
  const { requests, loading, error } = useSelector(
    (state: RootState) => state.requests
  );
  const [selectedTab, setSelectedTab] = useState("הכל");
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const resolvedMode: "client" | "supplier" = type;
  const actionLoading = useSelector(
    (state: RootState) => state.requests.loading
  );
 const [showCreateContractDialog, setShowCreateContractDialog] =
    useState(false);
  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    const sorted = [...requests].sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    if (selectedTab === "הכל") return sorted;

    return sorted.filter((r) => r.status === selectedTab);
  }, [requests, selectedTab]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ממתין":
        return "bg-yellow-100 text-yellow-800";
      case "מאושר":
        return "bg-green-100 text-green-800";
      case "נדחה":
        return "bg-red-100 text-red-800";
      case "פג":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusIcon = (status: string) => {
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
  };
  const handleAttachContract = (requestId: string) => {
    dispatch(SetSelectedSupplierRequest({ id: requestId }));
    setShowCreateContractDialog(true);
  }
  // return (
  //   <div className="space-y-6" style={{ direction: "rtl" }}>
  //     <h1 className="text-3xl font-bold">הבקשות שלי</h1>

  //     <Tabs value={selectedTab} onValueChange={setSelectedTab}>
  //       <TabsList>
  //         <TabsTrigger value="הכל">הכל</TabsTrigger>
  //         <TabsTrigger value="ממתין">ממתין</TabsTrigger>
  //         <TabsTrigger value="אושר">אושר</TabsTrigger>
  //         <TabsTrigger value="נדחה">נדחה</TabsTrigger>
  //       </TabsList>

  //       <TabsContent value={selectedTab} className="mt-6">
  //         {loading ? (
  //           <p>טוען...</p>
  //         ) : filteredRequests.length > 0 ? (
  //           <div className="space-y-3">
  //             {filteredRequests.map((request) => (
  //               <Card key={request._id}>
  //                 <CardHeader>
  //                   <div className="flex items-start justify-between">
  //                     <div className="flex-1">
  //                       <CardTitle className="text-lg">
  //                         ספק: {request.supplierId?.user.name}
  //                       </CardTitle>
  //                       <p className="mt-1 text-sm text-muted-foreground">
  //                         אירוע: {request.eventId.name}
  //                       </p>
  //                     </div>
  //                     <Badge variant={getStatusBadgeVariant(request.status)}>
  //                       {request.status}
  //                     </Badge>
  //                   </div>
  //                 </CardHeader>

  //                 <CardContent className="space-y-3">
  //                   <div className="flex items-center justify-between text-sm">
  //                     <span className="text-muted-foreground">
  //                       נשלח ב: {formatRequestDate(request.createdAt)}
  //                     </span>
  //                     <Button
  //                       variant="ghost"
  //                       size="sm"
  //                       onClick={() =>
  //                         setExpandedRequest(
  //                           expandedRequest === request._id ? null : request._id
  //                         )
  //                       }
  //                     >
  //                       {expandedRequest === request._id ? (
  //                         <>
  //                           <ChevronUp className="w-4 h-4 ml-1" />
  //                           הסתר פרטים
  //                         </>
  //                       ) : (
  //                         <>
  //                           <ChevronDown className="w-4 h-4 ml-1" />
  //                           הצג פרטים
  //                         </>
  //                       )}
  //                     </Button>
  //                   </div>

  //                   {expandedRequest === request._id && (
  //                     <div className="pt-3 space-y-3 border-t">
  //                       <p className="text-sm text-muted-foreground">
  //                         הודעה: {request.notesFromClient}
  //                       </p>
  //                       <div className="flex gap-2">
  //                         {/* <Link
  //                           to={`/ChatPage?requestId=${request._id}`}
  //                           // to={`${getPageUrl(ChatPage)}?requestId=${request._id}`}
  //                           className="flex-1"
  //                         > */}
  //                           <Button variant="outline" className="w-full">
  //                             <MessageSquare className="w-4 h-4 ml-2" />
  //                             צפה בצ'אט
  //                           </Button>
  //                         {/* </Link> */}
  //                         {request.status === "מאושר" && (
  //                           <Link
  //                             to={'/ContractsPaymentsPage'}
  //                           //   to={getPageUrl(ContractsPaymentsPage)}
  //                             className="flex-1"
  //                           >
  //                             <Button variant="outline" className="w-full">
  //                               <FileText className="w-4 h-4 ml-2" />
  //                               צפה בחוזה
  //                             </Button>
  //                           </Link>
  //                         )}
  //                       </div>
  //                     </div>
  //                   )}
  //                 </CardContent>
  //               </Card>
  //             ))}
  //           </div>
  //         ) : (
  //           <Card>
  //             <CardContent className="flex flex-col items-center justify-center py-12">
  //               <p className="mb-4 text-muted-foreground">עדיין לא שלחת בקשות</p>
  //               <Link to={'/suppliers'}>
  //                 <Button>חפש ספקים</Button>
  //               </Link>
  //             </CardContent>
  //           </Card>
  //         )}
  //       </TabsContent>
  //     </Tabs>

  //   </div>
  // );

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <h1 className="text-3xl font-bold">
        {resolvedMode === "supplier" ? "בקשות לספק" : "הבקשות שלי"}
      </h1>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="הכל">הכל</TabsTrigger>
          <TabsTrigger value="ממתין">ממתין</TabsTrigger>
          <TabsTrigger value="מאושר">אושר</TabsTrigger>
          <TabsTrigger value="נדחה">נדחה</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {error && (
            <div className="bg-red-50 p-4 rounded-lg text-red-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              טוען נתונים...
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="space-y-3">
              {filteredRequests.map((request) => (
                <Card key={request._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {request.eventId?.name || "אירוע"}
                        </CardTitle>

                        <p className="mt-1 text-sm">
                          {resolvedMode === "supplier"
                            ? `מ: ${
                                request.clientId?.name ||
                                request.clientId?.email ||
                                "לקוח"
                              }`
                            : `לספק: ${
                                request.supplierId?.user?.name ||
                                request.supplierId?.user?.email ||
                                "—"
                              }`}
                        </p>
                      </div>

                      <Badge className={`${getStatusColor(request.status)}`}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <span>{request.status}</span>
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        נשלח:{" "}
                        {request.createdAt
                          ? new Date(request.createdAt).toLocaleDateString(
                              "he-IL"
                            )
                          : "—"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedRequest(
                            expandedRequest === request._id ? null : request._id
                          )
                        }
                      >
                        {expandedRequest === request._id ? (
                          <>
                            <ChevronUp className="w-4 h-4 ml-1" />
                            הסתר פרטים
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 ml-1" />
                            הצג פרטים
                          </>
                        )}
                      </Button>
                    </div>

                    {expandedRequest === request._id && (
                      <div className="pt-3 space-y-3 border-t">
                        {request.basicEventSummary && (
                          <p className="text-sm text-muted-foreground">
                            תיאור: {request.basicEventSummary}
                          </p>
                        )}
                        {request.notesFromClient && (
                          <p className="text-sm">
                            הערות: {request.notesFromClient}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            <MessageSquare className="w-4 h-4 ml-2" />
                            צפה בצ'אט
                          </Button>

                          {request.status === "מאושר" && resolvedMode === "supplier" && (
                            <Button variant="outline" className="flex-1" onClick={() => handleAttachContract(request._id)}>
                              <Upload className="w-4 h-4 ml-2" />
                              צרף חוזה
                            </Button>
                          )}
                        </div>

                        {/* Buttons area with role-based actions */}
                        <div className="flex gap-2 justify-end pt-2">
                          {resolvedMode === "supplier" &&
                            request.status === "ממתין" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    dispatch(declineRequest(request._id))
                                  }
                                  disabled={actionLoading}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4 ml-2" />
                                  דחה
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    dispatch(approveRequest(request._id))
                                  }
                                  disabled={actionLoading}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 ml-2" />
                                  אשר
                                </Button>
                              </>
                            )}

                          {/* {resolvedMode === "client" && request.status === "ממתין" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleClientCancel(request._id)}
                              disabled={actionLoadingId === request._id}
                            >
                              ביטול בקשה
                            </Button>
                          )} */}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                אין בקשות
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
       <CreateContractDialog
                      open={showCreateContractDialog}
                      onOpenChange={(open) => {
                        setShowCreateContractDialog(open);
                      }}
                    />
    </div>
  );
}
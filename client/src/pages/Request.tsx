import { useMemo, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchRequests, // פעולה אסינכרונית שצריך להגדיר ב־Redux
  approveRequest,
  declineRequest,
} from "../store/requestSlice";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { MessageSquare, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import type { AppDispatch, RootState } from "../store";
import { getStatusBadgeVariant } from "../Utils/RequestUtils";
import { formatRequestDate } from "../Utils/DataUtils";

export default function Requests() {
  const dispatch:AppDispatch = useDispatch();
  const { requests, loading } = useSelector((state: RootState) => state.requests);
  const [selectedTab, setSelectedTab] = useState("הכל");
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

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

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <h1 className="text-3xl font-bold">הבקשות שלי</h1>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="הכל">הכל</TabsTrigger>
          <TabsTrigger value="ממתין">ממתין</TabsTrigger>
          <TabsTrigger value="אושר">אושר</TabsTrigger>
          <TabsTrigger value="נדחה">נדחה</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {loading ? (
            <p>טוען...</p>
          ) : filteredRequests.length > 0 ? (
            <div className="space-y-3">
              {filteredRequests.map((request) => (
                <Card key={request._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          ספק: {request.supplierId.user.name}
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          אירוע: {request.eventId.name}
                        </p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        נשלח ב: {formatRequestDate(request.createdAt)}
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
                        <p className="text-sm text-muted-foreground">
                          הודעה: {request.notesFromClient}
                        </p>
                        <div className="flex gap-2">
                          {/* <Link
                            to={`/ChatPage?requestId=${request._id}`}
                            // to={`${getPageUrl(ChatPage)}?requestId=${request._id}`}
                            className="flex-1"
                          > */}
                            <Button variant="outline" className="w-full">
                              <MessageSquare className="w-4 h-4 ml-2" />
                              צפה בצ'אט
                            </Button>
                          {/* </Link> */}
                          {request.status === "אושר" && (
                            <Link
                              to={'/ContractsPaymentsPage'}
                            //   to={getPageUrl(ContractsPaymentsPage)}
                              className="flex-1"
                            >
                              <Button variant="outline" className="w-full">
                                <FileText className="w-4 h-4 ml-2" />
                                צפה בחוזה
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="mb-4 text-muted-foreground">עדיין לא שלחת בקשות</p>
                <Link to={'/suppliers'}>
                  <Button>חפש ספקים</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React from "react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchSuppliers } from '../store/suppliersSlice';
import { fetchEvents } from '../store/eventsSlice';
import { fetchSupplierRequests } from '../store/supplierRequestsSlice';
import { fetchMessages, sendMessage, updateMessage } from '../store/chatSlice';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Send, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { formatMessageTime } from "../utils/DataUtils";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

export default function Chat() {
  const token = useSelector((state: RootState) => state.auth?.token);
  const user = useMemo(() => {
    if (!token) return { email: '' } as any;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return { email: '' } as any;
      const payload = JSON.parse(atob(parts[1]));
      return {
        email: payload.email || '',
        name: payload.name || '',
        _id: payload._id || payload.sub || '',
      } as any;
    } catch (e) {
      return { email: '' } as any;
    }
  }, [token]);
  const dispatch = useDispatch<AppDispatch>();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const urlParams = useMemo(
    () => new URLSearchParams(window.location.search),
    []
  );
  const requestIdFromUrl = urlParams.get("requestId");

  // Redux-backed data
  const requests = useSelector((state: RootState) => state.supplierRequests?.requestsList ?? []);
  const suppliers = useSelector((state: RootState) => state.suppliers?.suppliersList ?? []);
  const events = useSelector((state: RootState) => state.events?.eventsList ?? []);
  const messages = useSelector((state: RootState) => state.chat?.messages ?? []);
  const isSending = false; // send status available via chat state.error/loading if needed

  const suppliersMap = useMemo(() => {
    if (!suppliers) return new Map();
    return new Map(suppliers.map((s: any) => [s._id ?? s.id, s]));
  }, [suppliers]);

  const eventsMap = useMemo(() => {
    if (!events) return new Map();
    return new Map(events.map((e: any) => [e._id ?? e.id, e]));
  }, [events]);

  const threads = useMemo(() => {
    if (!requests || !messages) return [];

    return requests.map((request: any) => {
      const requestMessages = messages.filter((m: any) => (m.requestId === request.id || m.requestId === request._id) || (m.threadId === request._id || m.threadId === request.id));
      const lastMessage = requestMessages.sort((a: any, b: any) => {
        const atA = a.sentAt ?? a.createdAt ?? 0;
        const atB = b.sentAt ?? b.createdAt ?? 0;
        if (!atA) return 1;
        if (!atB) return -1;
        return new Date(atB).getTime() - new Date(atA).getTime();
      })[0];

      const unreadCount = requestMessages.filter((m: any) => !m.isRead && ((m as any).senderEmail ?? m.from?.id) !== user.email).length;

      return {
        request,
        supplier: suppliersMap.get(request.supplierId || request.supplierId || request.supplier?._id || ''),
        event: eventsMap.get(request.eventId || request.eventId || request.event?._id || ''),
        lastMessage,
        unreadCount,
      };
    });
  }, [requests, messages, suppliersMap, eventsMap, user.email]);

  const selectedThread = useMemo(() => {
    if (!selectedRequestId) return null;
    return threads.find((t) => t.request.id === selectedRequestId);
  }, [threads, selectedRequestId]);

  const conversationMessages = useMemo(() => {
    if (!selectedRequestId || !messages) return [];
    return messages
      .filter((m: any) => (m.requestId === selectedRequestId || m.threadId === selectedRequestId))
      .sort((a: any, b: any) => {
        const aAt = a.sentAt ?? a.createdAt ?? 0;
        const bAt = b.sentAt ?? b.createdAt ?? 0;
        if (!aAt) return -1;
        if (!bAt) return 1;
        return new Date(aAt).getTime() - new Date(bAt).getTime();
      });
  }, [selectedRequestId, messages]);

  useEffect(() => {
    if (requestIdFromUrl && requests) {
      const requestExists = requests.find((r) => r.id === requestIdFromUrl || (r._id === requestIdFromUrl));
      if (requestExists) {
        setSelectedRequestId(requestIdFromUrl);
      }
    } else if (threads.length > 0 && !selectedRequestId) {
      setSelectedRequestId(threads[0].request.id || threads[0].request._id);
    }
  }, [requestIdFromUrl, requests, threads, selectedRequestId]);

  useEffect(() => {
    if (selectedRequestId && messages) {
      const unreadMessages = messages.filter((m: any) => (m.requestId === selectedRequestId || m.threadId === selectedRequestId) && !m.isRead && ((m as any).senderEmail ?? m.from?.id) !== user.email);

      unreadMessages.forEach((msg: any) => {
        // call updateMessage thunk - cast data to any since server may accept isRead
        dispatch(updateMessage({ id: msg.id || msg._id, data: { isRead: true } as any }));
      });
    }
  }, [selectedRequestId, messages, user.email, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedRequestId) {
        dispatch(fetchMessages({ threadId: selectedRequestId }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedRequestId, dispatch]);

  // initial data load
  useEffect(() => {
    dispatch(fetchSuppliers());
    dispatch(fetchEvents());
    // fetch requests for current user (if email available)
    if (user?.email) dispatch(fetchSupplierRequests({ clientEmail: user.email }));
  }, [dispatch, user?.email]);

  // fetch messages when a thread is selected
  useEffect(() => {
    if (selectedRequestId) dispatch(fetchMessages({ threadId: selectedRequestId }));
  }, [selectedRequestId, dispatch]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedRequestId) return;

    try {
      await dispatch(sendMessage({ threadId: selectedRequestId, body: messageText.trim() })).unwrap();
      setMessageText("");
      dispatch(fetchMessages({ threadId: selectedRequestId }));
    } catch (error) {
      toast.error("שגיאה בשליחת ההודעה");
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)]" style={{ direction: "rtl" }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <Card className={`md:col-span-1 overflow-hidden ${isMobileView && selectedRequestId ? "hidden md:block" : ""}`}>
          <CardHeader>
            <CardTitle>שיחות</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto h-[calc(100vh-14rem)]">
              {threads.length > 0 ? (
                threads.map((thread) => (
                  <div
                    key={thread.request.id}
                    className={`p-4 border-b cursor-pointer hover:bg-muted transition-colors ${
                      selectedRequestId === thread.request.id ? "bg-primary/10" : ""
                    }`}
                    onClick={() => {
                      setSelectedRequestId(thread.request.id);
                      setIsMobileView(true);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {thread.supplier?.supplierName?.[0] || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium truncate">
                            {thread.supplier?.supplierName}
                          </p>
                          {thread.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {thread.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {thread.event?.eventName}
                        </p>
                        {thread.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate">
                            {thread.lastMessage.messageText}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  אין שיחות פעילות
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={`md:col-span-2 flex flex-col overflow-hidden ${!selectedRequestId || (!isMobileView && window.innerWidth < 768) ? "hidden md:flex" : ""}`}>
          {selectedThread ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => {
                      setIsMobileView(false);
                      setSelectedRequestId(null);
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {selectedThread.supplier?.supplierName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedThread.event?.eventName} •{" "}
                      {selectedThread.supplier?.category}
                    </p>
                  </div>
                  <Badge>{selectedThread.request.status}</Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversationMessages.map((message) => {
                  const isCurrentUser = message.senderEmail === user.email;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isCurrentUser
                            ? "bg-background text-foreground"
                            : "bg-primary/10"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.messageText}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatMessageTime(message.sentAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </CardContent>

              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="כתוב הודעה..."
                    rows={2}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <Button type="submit" disabled={isSending || !messageText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">בחר שיחה כדי להתחיל</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
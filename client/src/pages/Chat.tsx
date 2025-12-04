import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchThreads, fetchMessages, sendMessage, joinThread } from "../store/chatSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Send, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { formatMessageTime } from "../utils/DataUtils";
import type { Thread } from "../types/Thread";
import { getSocket } from "../services/socket";

export default function Chat() {
  const dispatch = useDispatch<AppDispatch>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const threads = useSelector((state: RootState) => state.chat.threads ?? []);
  const messagesByThread = useSelector((state: RootState) => state.chat.messagesByThread ?? {});

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [socketInstance, setSocketInstance] = useState<ReturnType<typeof getSocket> | null>(null);

  // Initialize socket
  useEffect(() => {
    if (!user) return;
    const s = getSocket(token);
    setSocketInstance(s);

    const handler = (msg: any) => {
      dispatch({ type: "chat/appendMessage", payload: msg });
    };
    s.on("new_message", handler);

    return () => {
      s.off("new_message", handler);
    };
  }, [user, token, dispatch]);

  // Fetch threads on load
  useEffect(() => {
    if (!user?._id) return;
    dispatch(fetchThreads({
      id: user._id,
      role: user.role === "supplier" ? "supplier" : "user",
    }));
  }, [user, dispatch]);

  // Join thread and fetch messages
  useEffect(() => {
    if (selectedThreadId) {
      dispatch(joinThread({ threadId: selectedThreadId }));
      dispatch(fetchMessages({ threadId: selectedThreadId }));
    }
  }, [selectedThreadId, dispatch]);

  // Thread opened: mark as read
  const onThreadOpened = (thread: Thread) => {
    if (thread.hasUnread) {
      dispatch({ type: "chat/markThreadAsRead", payload: { threadId: thread._id } });
    }
  };

  // Ensure _id is string
  const safeThreads = useMemo(() => threads.map(t => ({ ...t, _id: t._id.toString() })), [threads]);

  // Sort threads: unread first, then by updatedAt
  const sortedThreads = useMemo(() => {
    return [...safeThreads].sort((a, b) => {
      if (a.hasUnread && !b.hasUnread) return -1;
      if (!a.hasUnread && b.hasUnread) return 1;
      return new Date(b.updatedAt || "").getTime() - new Date(a.updatedAt || "").getTime();
    });
  }, [safeThreads]);

  // Prepare messages for selected thread
  const conversationMessages = useMemo(() => {
    if (!selectedThreadId) return [];
    const messages = messagesByThread[selectedThreadId];
    if (!Array.isArray(messages)) return [];
    return messages
      .map((m, idx) => ({
        ...m,
        _id: m._id?.toString() || `msg-${idx}`,
        threadId: m.threadId?.toString() || selectedThreadId,
        from: (m as any).from || "",
        to: (m as any).to || "",
        createdAt: typeof (m as any).createdAt === "string"
          ? (m as any).createdAt
          : ((m as any).createdAt ? new Date((m as any).createdAt).toISOString() : new Date().toISOString()),
      }))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messagesByThread, selectedThreadId]);

  // Scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !selectedThreadId || !user || !socketInstance) return;

    const thread = safeThreads.find(t => t._id === selectedThreadId);
    if (!thread) return;
    const receiverId = user.role === "supplier" ? thread.userId : thread.supplierId;

    try {
      socketInstance.emit("send_message", {
        threadId: selectedThreadId,
        to: receiverId,
        body: messageText.trim(),
      });
      setDebugLog((s) => [...s, `sent: ${messageText.trim()}`]);
      setMessageText("");
    } catch {
      toast.error("שגיאה בשליחת ההודעה");
      setDebugLog((s) => [...s, `send failed: ${messageText.trim()}`]);
    }
  };

  // Debug test send
  const handleTestSend = async () => {
    if (!selectedThreadId) {
      setDebugLog((s) => [...s, "no thread selected"]);
      return;
    }
    try {
      setDebugLog((s) => [...s, "test send -> dispatching sendMessage..."]);
      await dispatch(sendMessage({ threadId: selectedThreadId, body: "[test] hello" })).unwrap();
      setDebugLog((s) => [...s, "test send succeeded"]);
    } catch (err: any) {
      setDebugLog((s) => [...s, `test send error: ${err?.message || err}`]);
    }
  };

  // Helpers
  const getThreadName = (thread: Thread) => user?.role === "supplier" ? thread.clientName : thread.supplierName;
  const getAvatarLetter = (thread: Thread) => (getThreadName(thread)?.[0] || "?").toUpperCase();

  return (
    <div className="h-[calc(100vh-8rem)]" style={{ direction: "rtl" }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">

        {/* Sidebar */}
        <Card className={`md:col-span-1 overflow-hidden ${isMobileView && selectedThreadId ? "hidden md:block" : ""}`}>
          <CardHeader><CardTitle>שיחות</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto h-[calc(100vh-14rem)]">
              {sortedThreads.length > 0 ? sortedThreads.map(thread => (
                <div
                  key={thread._id}
                  className={`p-4 border-b cursor-pointer hover:bg-muted transition-colors ${selectedThreadId === thread._id ? "bg-primary/10" : ""}`}
                  onClick={() => { setSelectedThreadId(thread._id); setIsMobileView(true); onThreadOpened(thread); }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar><AvatarFallback>{getAvatarLetter(thread)}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">{getThreadName(thread)}</p>
                        {thread.hasUnread && <Badge variant="destructive" className="text-xs px-2 py-0.5">חדש</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{thread.eventName}</p>
                    </div>
                  </div>
                </div>
              )) : <div className="p-4 text-center text-muted-foreground">אין שיחות פעילות</div>}
            </div>
          </CardContent>
        </Card>

        {/* Chat view */}
        <Card className={`md:col-span-2 flex flex-col overflow-hidden ${!selectedThreadId || (!isMobileView && window.innerWidth < 768) ? "hidden md:flex" : ""}`}>
          {selectedThreadId ? (
            <>
              {/* Debug panel */}
              <div className="p-2 border-b bg-muted/50 text-xs">
                <div className="flex items-center gap-4">
                  <div>token: <span className="font-mono break-all">{token ? token.slice(0, 40) + (token.length > 40 ? "..." : "") : "(none)"}</span></div>
                  <div>socket: <strong>{socketInstance?.connected ? 'connected' : 'disconnected'}</strong></div>
                  <button onClick={handleTestSend} className="ml-auto bg-primary text-white px-2 py-1 rounded">Test send</button>
                </div>
                <div className="mt-2">
                  <div className="whitespace-pre-wrap text-xs max-h-24 overflow-y-auto">
                    {debugLog.map((l, i) => <div key={i}>{l}</div>)}
                  </div>
                </div>
              </div>

              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="md:hidden" onClick={() => { setIsMobileView(false); setSelectedThreadId(null); }}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{getThreadName(safeThreads.find(t => t._id === selectedThreadId)!)}</CardTitle>
                    <p className="text-sm text-muted-foreground">{safeThreads.find(t => t._id === selectedThreadId)?.eventName}</p>
                  </div>
                  <Badge>{safeThreads.find(t => t._id === selectedThreadId)?.status}</Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversationMessages.length > 0 ? conversationMessages.map(msg => {
                  const isCurrentUser = msg.from === user?._id;
                  const thread = safeThreads.find(t => t._id === selectedThreadId)!;
                  return (
                    <div key={msg._id} className={`flex items-start gap-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                      {!isCurrentUser && <Avatar className="h-8 w-8"><AvatarFallback>{getAvatarLetter(thread)}</AvatarFallback></Avatar>}
                      <div className={`max-w-[70%] rounded-lg p-3 ${isCurrentUser ? "bg-background text-foreground" : "bg-primary/10"}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatMessageTime(msg.createdAt)}</p>
                      </div>
                      {isCurrentUser && <Avatar className="h-8 w-8"><AvatarFallback>{user?.name?.[0] || "אני"}</AvatarFallback></Avatar>}
                    </div>
                  );
                }) : <p className="text-center text-muted-foreground">אין הודעות להצגה</p>}
                <div ref={messagesEndRef} />
              </CardContent>

              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Textarea
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder="כתוב הודעה..."
                    rows={2}
                    className="flex-1"
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  />
                  <Button type="submit" disabled={!messageText.trim()}><Send className="h-4 w-4" /></Button>
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

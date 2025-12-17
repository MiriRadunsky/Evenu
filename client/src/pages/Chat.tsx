import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchThreads, fetchMessages, joinThread } from "../store/chatSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Send, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import type { Thread } from "../types/Thread";
import { getSocket } from "../socket/socket";
import type { Message } from "@/types/Message";
import { markMessagesAsRead } from "../services/messageService";

export default function Chat() {
  const dispatch = useDispatch<AppDispatch>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const threads = useSelector((state: RootState) => state.chat.threads ?? []);
  const messagesByThread = useSelector(
    (state: RootState) => state.chat.messagesByThread ?? {}
  );

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [socketInstance, setSocketInstance] =
    useState<ReturnType<typeof getSocket> | null>(null);

  /* ---------------- Socket init (ONLY ONCE) ---------------- */
  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    setSocketInstance(socket);

    const handleConnect = () => console.log("Socket connected:", socket.id);

    const handleNewMessage = (msg: Message) => {
      dispatch({ type: "chat/appendMessage", payload: msg });

      if (msg.threadId !== selectedThreadId) {
        dispatch(
          fetchThreads({
            role: user.role === "supplier" ? "supplier" : "user",
          })
        );
      }
    };

    const handleMessagesRead = ({
      threadId,
      userId: readUserId,
    }: {
      threadId: string;
      userId: string;
    }) => {
      if (readUserId !== user._id) {
        dispatch(fetchMessages({ threadId }));
      }
    };

    socket.on("connect", handleConnect);
    socket.on("new_message", handleNewMessage);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("new_message", handleNewMessage);
      socket.off("messages_read", handleMessagesRead);
      socket.disconnect();
    };
  }, [user, dispatch, selectedThreadId]);

  /* ---------------- Fetch threads ---------------- */
  useEffect(() => {
    if (!user) return;
    dispatch(
      fetchThreads({
        role: user.role === "supplier" ? "supplier" : "user",
      })
    );
  }, [user, dispatch]);

  /* ---------------- Join + fetch messages ---------------- */
  useEffect(() => {
    if (!selectedThreadId || !socketInstance) return;

    socketInstance.emit("join_thread", selectedThreadId);
    dispatch(joinThread({ threadId: selectedThreadId }));
    dispatch(fetchMessages({ threadId: selectedThreadId }));
  }, [selectedThreadId, socketInstance, dispatch]);

  /* ---------------- Helpers ---------------- */
  const hasUnread = (threadId: string) => {
    const msgs = messagesByThread[threadId] || [];
    const userId = user?._id ?? "";
    return msgs.some(
      (msg: Message) =>
        msg.from !== userId && (!msg.readBy || !msg.readBy.includes(userId))
    );
  };

  const markThreadAsReadIfNeeded = async (thread: Thread) => {
    if (!hasUnread(thread._id)) return;

    await markMessagesAsRead(thread._id);
    socketInstance?.emit("read_messages", {
      threadId: thread._id,
      userId: user?._id,
    });

    dispatch(fetchMessages({ threadId: thread._id }));
    dispatch(
      fetchThreads({
        role: user?.role === "supplier" ? "supplier" : "user",
      })
    );
  };

  const safeThreads = useMemo(
    () => threads.map((t) => ({ ...t, _id: t._id.toString() })),
    [threads]
  );

  const sortedThreads = useMemo(() => {
    return [...safeThreads].sort((a, b) => {
      const aMsgs = messagesByThread[a._id] || [];
      const bMsgs = messagesByThread[b._id] || [];
      const aLast =
        aMsgs.length > 0
          ? new Date(aMsgs[aMsgs.length - 1].createdAt).getTime()
          : new Date(a.updatedAt || 0).getTime();
      const bLast =
        bMsgs.length > 0
          ? new Date(bMsgs[bMsgs.length - 1].createdAt).getTime()
          : new Date(b.updatedAt || 0).getTime();
      return bLast - aLast;
    });
  }, [safeThreads, messagesByThread]);

  const conversationMessages = useMemo(() => {
    if (!selectedThreadId) return [];
    return (messagesByThread[selectedThreadId] || []).slice().sort(
      (a: Message, b: Message) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );
  }, [messagesByThread, selectedThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  /* ---------------- Send message ---------------- */
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedThreadId || !socketInstance) return;

    try {
      socketInstance.emit("send_message", {
        threadId: selectedThreadId,
        body: messageText.trim(),
      });
      setMessageText("");
    } catch {
      toast.error("שגיאה בשליחת ההודעה");
    }
  };

  /* ---------------- UI helpers ---------------- */
  const getThreadName = (thread: Thread) =>
    user?.role === "supplier" ? thread.clientName : thread.supplierName;

  const getAvatarLetter = (thread: Thread) =>
    (getThreadName(thread)?.[0] || "?").toUpperCase();

  /* ---------------- JSX ---------------- */
  return (
    <div className="h-[calc(100vh-8rem)]" style={{ direction: "rtl" }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {/* Sidebar */}
        <Card
          className={`md:col-span-1 overflow-hidden ${
            isMobileView && selectedThreadId ? "hidden md:block" : ""
          }`}
        >
          <CardHeader>
            <CardTitle>שיחות</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto h-[calc(100vh-14rem)]">
              {sortedThreads.length > 0 ? (
                sortedThreads.map((thread) => (
                  <div
                    key={thread._id}
                    className={`p-4 border-b cursor-pointer hover:bg-muted transition-colors ${
                      selectedThreadId === thread._id ? "bg-primary/10" : ""
                    }`}
                    onClick={() => {
                      setSelectedThreadId(thread._id);
                      setIsMobileView(true);
                      markThreadAsReadIfNeeded(thread);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getAvatarLetter(thread)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium truncate">{getThreadName(thread)}</p>
                          {hasUnread(thread._id) && (
                            <Badge variant="destructive" className="text-xs px-2 py-0.5">
                              חדש
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{thread.eventName}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">אין שיחות פעילות</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat view */}
        <Card
          className={`md:col-span-2 flex flex-col overflow-hidden ${
            !selectedThreadId || (!isMobileView && window.innerWidth < 768)
              ? "hidden md:flex"
              : ""
          }`}
        >
          {selectedThreadId ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => {
                      setIsMobileView(false);
                      setSelectedThreadId(null);
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {getThreadName(safeThreads.find((t) => t._id === selectedThreadId)!)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {safeThreads.find((t) => t._id === selectedThreadId)?.eventName}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversationMessages.length > 0 ? (
                  conversationMessages.map((msg) => {
                    const isCurrentUser = msg.from === user?._id;
                    const thread = safeThreads.find((t) => t._id === selectedThreadId)!;
                    return (
                      <div
                        key={msg._id}
                        className={`flex items-start gap-2 ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{getAvatarLetter(thread)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isCurrentUser ? "bg-background text-foreground" : "bg-primary/10"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                        </div>
                        {isCurrentUser && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{user?.name?.[0] || "אני"}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground">אין הודעות להצגה</p>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              <div className="border-t p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="כתוב הודעה..."
                    rows={2}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    onFocus={() => {
                      const thread = safeThreads.find((t) => t._id === selectedThreadId);
                      if (thread) markThreadAsReadIfNeeded(thread);
                    }}
                  />
                  <Button type="submit" disabled={!messageText.trim()}>
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

import * as messageService from "../services/message.service.js";
import * as threadRepo from "../repositories/thread.repository.js";

/**
 * רישום אירועי צ'אט לכל Socket
 * @param {import("socket.io").Server} io 
 * @param {import("socket.io").Socket} socket 
 */
export function registerChatHandlers(io, socket) {

  // הצטרפות לחדר צ'אט (thread)
  socket.on("join_thread", async (threadId) => {
    try {
      socket.join(threadId);

      const messages = await messageService.getThreadMessages(threadId);
      socket.emit("thread_messages", { threadId, messages });

      if (socket.user?.id) {
        await messageService.markMessagesAsRead(threadId, socket.user.id);
        io.to(threadId).emit("messages_read", { threadId, userId: socket.user.id });
      }
    } catch (err) {
      console.error("join_thread error:", err);
      socket.emit("error", { message: "Could not join thread" });
    }
  });

  // שליחת הודעה חדשה
  socket.on("send_message", async (payload) => {
    try {
      const { threadId, to: maybeTo, body } = payload || {};
      if (!threadId || !body) {
        return socket.emit("error", { message: "Invalid message payload" });
      }

      let to = maybeTo;

      // אם לא סופק to, קובע לפי thread
      if (!to) {
        const thread = await threadRepo.getThreadWithParticipants(threadId);
        if (!thread) return socket.emit("error", { message: "Thread not found" });

        const senderId = String(socket.user.id);
        const threadUserId = thread.userId ? String(thread.userId._id || thread.userId) : null;
        const supplierUserId = thread.supplierId?.user ? String(thread.supplierId.user._id || thread.supplierId.user) : null;

        if (threadUserId && senderId === threadUserId) {
          to = supplierUserId;
        } else {
          to = threadUserId;
        }
      }

      if (!to) return socket.emit("error", { message: "Could not determine recipient" });

      const newMsg = await messageService.sendMessage({
        threadId,
        from: socket.user.id,
        to,
        body,
      });

      io.to(threadId).emit("new_message", newMsg);
    } catch (err) {
      console.error("send_message error:", err);
      socket.emit("error", { message: "Could not send message" });
    }
  });
}

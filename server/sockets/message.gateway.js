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
  socket.on("send_message", async ({ threadId, body }) => {
    try {
      if (!threadId || !body || !socket.user.id) {
        return socket.emit("error", { message: "Invalid message payload" });
      }

      const thread = await threadRepo.getThreadById(threadId);
      if (!thread) return;
      console.log("user ",socket.user);
      console.log("thread info ",thread);
      console.log("check",socket.user.id ,thread.supplierUserId);
      
       const receiverId =
        socket.user.id === thread.supplierUserId.toString()
          ? thread.userId     // שולח הוא הספק → שולחים למשתמש
          : thread.supplierUserId; // שולח הוא המשתמש → שולחים לספק

       const newMsg = await messageService.sendMessage({
        threadId,
        from: socket.user.id,
        to: receiverId,
        body: body.trim(),
      });     
      // אם לא סופק to, קובע לפי thread

      io.to(threadId).emit("new_message", newMsg);
    } catch (err) {
      console.error("send_message error:", err);
      socket.emit("error", { message: "Could not send message" });
    }
  });
}

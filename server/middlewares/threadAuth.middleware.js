import * as threadSrv from "../services/threads.service.js";
export async function threadAuthGuard(req, res, next) {
  try {
    const { threadId } = req.params;
    if (!threadId) {
      return res.status(400).json({ message: "threadId חסר" });
    }
    const userId = req.user._id.toString();
    const thread = await threadSrv.serviceGetThreadById(threadId);
    if (!thread) {
      return res.status(404).json({ message: "שיחה לא נמצאה" });
    }
    if (
      thread.userId.toString() !== userId &&
      thread.supplierUserId.toString() !== userId
    ) {
      return res.status(403).json({ message: "אין גישה לשיחה" });
    }
    req.thread = thread;
    next();
  } catch (err) {
    next(err);
  }
}


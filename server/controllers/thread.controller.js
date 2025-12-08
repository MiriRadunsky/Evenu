import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import * as srv from "../services/threads.service.js";

// יצירת ת'רד או החזרת קיים לפי הבקשה
export const createOrReuseThread = asyncHandler(async (req, res) => {
  const { requestId, userId, supplierId } = req.body;

  const thread = await srv.getOrCreateThread({
    requestId,
    userId,
    supplierId,
  });

  res.json({
    threadId: thread._id,
    thread,
  });
}
)
// קבלת ת'רד לפי ID
export const getThread = asyncHandler(async (req, res) => {
  const { threadId } = req.params;
  const thread = await srv.serviceGetThreadById(threadId);
  res.json(thread);
})

// כל הת'רדים של משתמש
export const getUserThreads = asyncHandler(async (req, res) => {
  // Accept userId from route param or from authenticated user (passport)
  console.log(req.user)
  // passport may have set req.user with id or _id
  const userId = req.user?.id || req.user?._id;
  console.log("Getting threads for user:", userId);

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const threads = await srv.serviceGetThreadsForUser(userId);
  res.json(threads);
})

// כל הת'רדים של ספק
export const getSupplierThreads = asyncHandler(async (req, res) => {

  const  supplierId  = req.user.id || req.user?._id;
  console.log("Getting threads for user:", supplierId);

  const threads = await srv.serviceGetThreadsForSupplier(supplierId);
  res.json(threads);
});

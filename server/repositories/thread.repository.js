import Thread from "../models/threads.model.js";

/**
 * Create a new thread
 */
export async function createThread({ requestId, userId, supplierId, supplierUserId, deleteAt }) {
  return Thread.create({ requestId, userId, supplierId, supplierUserId, deleteAt });
}

/**
 * Get a thread by requestId
 */
export async function getThreadByRequestId(requestId) {
  return Thread.findOne({ requestId });
}

/**
 * Get a thread by _id
 */
export async function getThreadById(threadId) {
  console.log("Repository: Fetching thread with ID:", threadId);
  return Thread.findById(threadId);
}

/**
 * Generic helper to fetch threads with populated fields
 */
async function getThreadsByFilter(filter) {
  return Thread.find(filter)
    .populate({
      path: "supplierId",
      populate: { path: "user", select: "name" },
    })
    .populate({ path: "userId", select: "name" })
    .populate({
      path: "requestId",
      model: "SupplierRequest",
      select: "status eventId",
      populate: { path: "eventId", model: "Event", select: "name" },
    })
    .lean();
}

/**
 * Get all threads for a normal user
 */
export async function getThreadsForUser(userId) {
  return getThreadsByFilter({ userId });
}

/**
 * Get all threads for a supplier (by supplierUserId)
 */
export async function getThreadsForSupplier(supplierUserId) {
  console.log("Repository: Getting threads for supplier user:", supplierUserId);
  return getThreadsByFilter({ supplierUserId });
}

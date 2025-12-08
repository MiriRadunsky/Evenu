import * as repo from "../repositories/thread.repository.js";
import { SupplierRepository } from "../repositories/suppliers.repositry.js";
import { hasUnreadMessages } from "../repositories/message.repository.js";
import { AppError } from "../middlewares/error.middleware.js";

/**
 * Create or return existing thread
 */
export async function getOrCreateThread({ requestId, userId, supplierId, delDate }) {
  const existingThread = await repo.getThreadByRequestId(requestId);
  if (existingThread) return existingThread;

  const supplier = await SupplierRepository.getSupplierById(supplierId);
  if (!supplier) throw new AppError(404, "ספק לא נמצא");

  const thread = await repo.createThread({
    requestId,
    userId,
    supplierId,
    supplierUserId: supplier.user, // ← חדש
    deleteAt: delDate,
  });
  return thread;
}

/**
 * Get thread by ID
 */
export async function serviceGetThreadById(threadId) {
  return repo.getThreadById(threadId);
}

/**
 * Enrich threads with additional fields
 */
async function enrichThreads(threads, userId) {
  return Promise.all(
    threads.map(async (thread) => {
      const unread = await hasUnreadMessages(thread._id, userId);

      return {
        _id: thread._id.toString(),
        userId: thread.userId?._id?.toString() ?? null,
        supplierId: thread.supplierId
          ? { ...thread.supplierId, _id: thread.supplierId._id.toString() }
          : null,
        supplierUserId: thread.supplierUserId?.toString() ?? null,
        requestId: thread.requestId
          ? {
              _id: thread.requestId._id.toString(),
              status: thread.requestId.status,
              eventId: thread.requestId.eventId
                ? { ...thread.requestId.eventId, _id: thread.requestId.eventId._id.toString() }
                : null,
            }
          : null,
        supplierName: thread.supplierId?.user?.name ?? "",
        clientName: thread.userId?.name ?? "",
        eventName: thread.requestId?.eventId?.name ?? "",
        status: thread.requestId?.status ?? "",
        hasUnread: !!unread,
      };
    })
  );
}

/**
 * Get threads for a normal user
 */
export async function serviceGetThreadsForUser(userId) {
  const threads = await repo.getThreadsForUser(userId);
  return enrichThreads(threads, userId);
}

/**
 * Get threads for a supplier (by supplierUserId)
 */
export async function serviceGetThreadsForSupplier(supplierUserId) {
  console.log("Service: Getting threads for supplier user:", supplierUserId);
  const threads = await repo.getThreadsForSupplier(supplierUserId);
  return enrichThreads(threads, supplierUserId);
}

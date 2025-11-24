import * as repo from "../repositories/thread.repository.js";
import { sendMessage } from "./message.service.js";
import {SupplierService} from "./supplier.service.js";
import {SupplierRepository} from "../repositories/suppliers.repositry.js";
import { hasUnreadMessages } from "../repositories/message.repository.js";

export async function getOrCreateThread({ requestId, userId, supplierId, delDate }) {
  const existingThread = await repo.getThreadByRequestId(requestId);

  if (existingThread) {
    return existingThread; // reuse
  }

  const thread = await repo.createThread({ requestId, userId, supplierId, delDate });
  const threadId = thread._id;
  const body = "פנייתך בהמתנה";
  const suppiler = await SupplierService.getSupplier(supplierId)  
  const msg = await sendMessage({ threadId, from: userId, to: supplierId, body });
  return thread;
}

export async function serviceGetThreadById(threadId) {
  return await repo.getThreadById(threadId);
}


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

        hasUnread: !!unread, // ← כאן זה נכנס
      };
    })
  );
}


export async function serviceGetThreadsForUser(userId) {
  const threads = await repo.getThreadsForUser(userId);
  const enrichedThreads = await enrichThreads(threads, userId);
  return enrichedThreads;
}

export async function serviceGetThreadsForSupplier(supplierUserId) {
  const supplierId = await SupplierRepository.getSupplierIdByUserId(supplierUserId);
  const threads = await repo.getThreadsForSupplier(supplierId);
  const enrichedThreads = await enrichThreads(threads, supplierUserId);
  return enrichedThreads;
}

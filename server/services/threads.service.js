import { countUnreadMessages } from "../repositories/message.repository.js";
import * as repo from "../repositories/thread.repository.js";
import { sendMessage } from "./message.service.js";
import {SupplierService} from "./supplier.service.js";
import {SupplierRepository} from "../repositories/suppliers.repositry.js";

export async function getOrCreateThread({ requestId, userId, supplierId }) {
  const existingThread = await repo.getThreadByRequestId(requestId);

  if (existingThread) {
    return existingThread; // reuse
  }

  const thread = await repo.createThread({ requestId, userId, supplierId });
  const threadId = thread._id;
  const body = "פנייתך בהמתנה";
  const suppiler = await SupplierService.getSupplier(supplierId)
  console.log("details - msg ", threadId, userId, suppiler.user, body );
  
  const msg = await sendMessage({ threadId, from: userId, to: supplierId, body });
  console.log("details - msg sent ", msg ); 
  return thread;
}

export async function serviceGetThreadById(threadId) {
  return await repo.getThreadById(threadId);
}

// export async function serviceGetThreadsForUser(userId) {
//   const threads = await repo.getThreadsForUser(userId);
//   console.log("threads!!!!!!!!! ", threads);

//   const enrichedThreads = await Promise.all(
//       threads.map(async thread => ({
//       ...thread, // פה זה כבר Object רגיל – מצוין
//       supplierName: thread.supplierId?.user?.name ?? "",
//       eventName: thread.requestId?.eventId?.name ?? "",
//       status: thread.requestId?.status ?? "",
//       // unreadCount: await countUnreadMessages(thread._id, userId)
//     }))
//   );
//   console.log("enrichedThreads!!!!!!!!! ", enrichedThreads);

//   return enrichedThreads;
// }

export async function serviceGetThreadsForUser(userId) {
  console.log("serviceGetThreadsForUser userId: ", userId);
  const threads = await repo.getThreadsForUser(userId);

  const enrichedThreads = threads.map(thread => ({
    _id: thread._id.toString(),
    userId: thread.userId.toString(),
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
    eventName: thread.requestId?.eventId?.name ?? "",
    status: thread.requestId?.status ?? "",
    // unreadCount: await countUnreadMessages(thread._id, userId)
  }));
  console.log("enrichedThreads!!!!!!!!! ", enrichedThreads);
  return enrichedThreads;
}



export async function serviceGetThreadsForSupplier(supplierUserId) {
  const supplierId = await SupplierRepository.getSupplierIdByUserId(supplierUserId);
  if (!supplierId) {
      throw new AppError(404, "ספק לא נמצא");
    }
  const threads = await repo.getThreadsForSupplier(supplierId);
  const enrichedThreads = threads.map(thread => ({
    _id: thread._id.toString(),
    userId: thread.userId.toString(),
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
    eventName: thread.requestId?.eventId?.name ?? "",
    status: thread.requestId?.status ?? "",
    // unreadCount: await countUnreadMessages(thread._id, userId)
  }));
  console.log("enrichedThreads for supplier!!!!!!!!! ", enrichedThreads);
  return enrichedThreads;
}

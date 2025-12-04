import Thread from "../models/threads.model.js";

export async function createThread({ requestId, userId, supplierId }) {
  return await Thread.create({ requestId, userId, supplierId });
}

export async function getThreadByRequestId(requestId) {
  return await Thread.findOne({ requestId });
}

export async function getThreadById(threadId) {
  console.log("Fetching thread with ID:", threadId);
  return await Thread.findById(threadId);
}

export async function getThreadWithParticipants(threadId) {
  return Thread.findById(threadId)
    .populate({ path: 'userId', select: '_id' })
    .populate({ path: 'supplierId', populate: { path: 'user', select: '_id' } });
}

async function getThreadsByFilter(filter) {
  return Thread.find(filter)
    .populate({
      path: "supplierId",
      populate: { path: "user", select: "name" }
    })
     .populate({
      path: "userId",           
      select: "name"            
    })
    .populate({
      path: "requestId",
      model: "SupplierRequest",
      select: "status eventId",
      populate: { path: "eventId", model: "Event", select: "name" }
    })
    .lean();
}

export async function getThreadsForUser(userId) {
  return getThreadsByFilter({ userId });
}

export async function getThreadsForSupplier(supplierId) {
  return getThreadsByFilter({ supplierId });
}


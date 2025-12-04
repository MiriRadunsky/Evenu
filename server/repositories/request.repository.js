
import SupplierRequest from "../models/request.model.js";
function buildRequestSearchFilter(searchTerm) {
  if (!searchTerm || typeof searchTerm !== "string" || !searchTerm.trim()) {
    return {};
  }

  const regex = new RegExp(searchTerm.trim(), "i");

  return {
    $or: [
      { notesFromClient: regex },
      { "basicEventSummary.eventName": regex },
      { "basicEventSummary.location": regex },
      { "basicEventSummary.type": regex },
    ],
  };
}

export const RequestRepository = {

  async getRequestsByUserId(
    userId,
    { page = 1, limit = 10, status, eventId, searchTerm } = {}
  ) {
    const baseFilter = { clientId: userId };

    if (status && status !== "הכל") {
      baseFilter.status = status;
    }

    if (eventId) {
      baseFilter.eventId = eventId;
    }

    const searchFilter = buildRequestSearchFilter(searchTerm);

    const query = {
      ...baseFilter,
      ...searchFilter,
    };

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const [items, total] = await Promise.all([
      SupplierRequest.find(query)
        .populate("eventId")
        .populate({
          path: "supplierId",
          populate: {
            path: "user",
            select: "name email",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      SupplierRequest.countDocuments(query),
    ]);

    return {
      items,
      total,
      page: pageNumber,
      pageSize: limitNumber,
      totalPages: Math.ceil(total / limitNumber) || 1,
    };
  },
  async createRequest({
    eventId,
    supplierId,
    clientId,
    notesFromClient,
    basicEventSummary,
    expiresAt,
  }) {
    const request = new SupplierRequest({
      eventId,
      supplierId,
      clientId,
      notesFromClient,
      basicEventSummary,
      expiresAt,
    });

    return request.save();
  },

  async updateStatus(id, status) {
    return SupplierRequest.findByIdAndUpdate(id, { status }, { new: true })
      .populate("eventId")
      .populate({
        path: "supplierId",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate("clientId");
  },

   async getBySupplier(
    supplierId,
    { page = 1, limit = 10, status, eventId, searchTerm } = {}
  ) {
    const baseFilter = { supplierId };

    if (status && status !== "הכל") {
      baseFilter.status = status;
    }

    if (eventId) {
      baseFilter.eventId = eventId;
    }

    const searchFilter = buildRequestSearchFilter(searchTerm);

    const query = {
      ...baseFilter,
      ...searchFilter,
    };

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const [items, total] = await Promise.all([
      SupplierRequest.find(query)
        .populate("clientId", "name email")
        .populate("eventId", "name date")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      SupplierRequest.countDocuments(query),
    ]);

    return {
      items,
      total,
      page: pageNumber,
      pageSize: limitNumber,
      totalPages: Math.ceil(total / limitNumber) || 1,
    };
  },
  async checkIfRequestExists({ eventId, supplierId, clientId }) {
  return SupplierRequest.findOne({
    eventId,
    supplierId,
    clientId,
    status: { $in: ["ממתין", "מאושר"] },
  });


  },
  async getRequestById(_id) {    
   return await SupplierRequest.findById(_id)
  },
  async updateRequestTheardId(requestId, threadId) {
    return SupplierRequest.findByIdAndUpdate(
      requestId,
      { threadId },
      { new: true }
    );
  },
};




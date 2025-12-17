import SupplierRequest from "../models/request.model.js";
import Supplier from "../models/supplier.model.js";
import Category from "../models/category.model.js";
function buildRequestSearchFilter(searchTerm) {
  // No-op: filtering will be done in JS after population
  return {};
}

export const RequestRepository = {
  async getRequestsByUserId(
    userId,
    { page = 1, limit = 5, status, eventId, searchTerm, category } = {}
  ) {
    const baseFilter = { clientId: userId };
    const isVirtualStatus = status === "פג";
    if (!isVirtualStatus && status && status !== "הכל") {
      baseFilter.status = status;
    }

    // If category provided (label or id), find supplier ids in that category and filter
    if (category) {
      let catDoc = null;
      try {
        catDoc = await Category.findById(category).lean();
      } catch (e) {
        catDoc = null;
      }
      if (!catDoc) {
        catDoc = await Category.findOne({ label: category }).lean();
      }
      if (catDoc) {
        const suppliers = await Supplier.find({ category: catDoc._id }).select("_id").lean();
        const supplierIds = suppliers.map(s => s._id);
        if (supplierIds.length === 0) {
          // no suppliers in category -> return empty page
          return {
            items: [],
            total: 0,
            page: Number(page) || 1,
            pageSize: Number(limit) || 5,
            totalPages: 1,
          };
        }
        baseFilter.supplierId = { $in: supplierIds };
      }
    }

    if (eventId) {
      baseFilter.eventId = eventId;
    }

    // Combine category and eventId filters if both are present
    if (category && eventId) {
      baseFilter.$and = [
        { supplierId: baseFilter.supplierId },
        { eventId: baseFilter.eventId },
      ];
      delete baseFilter.supplierId;
      delete baseFilter.eventId;
    }

    const query = { ...baseFilter };
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Always populate supplier for search
    let all = await SupplierRequest.find(query)
      .populate("eventId")
      .populate({
        path: "supplierId",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    // Filter by virtual status if needed
    if (isVirtualStatus) {
      const now = new Date();
      all = all.filter(r => r.expiresAt && r.expiresAt < now);
    }

    // Filter by supplier name/email if searchTerm is present
    if (searchTerm && searchTerm.trim()) {
      const regex = new RegExp(searchTerm.trim(), "i");
      all = all.filter(r => {
        const supplierUser = r.supplierId && r.supplierId.user;
        if (!supplierUser) return false;
        return regex.test(supplierUser.name) || regex.test(supplierUser.email);
      });
    }

    return {
      items: all.slice(skip, skip + limitNumber),
      total: all.length,
      page: pageNumber,
      pageSize: limitNumber,
      totalPages: Math.ceil(all.length / limitNumber),
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
    { page = 1, limit = 10, status, eventId, searchTerm, category } = {}
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




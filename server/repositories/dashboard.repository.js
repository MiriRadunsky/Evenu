import Event from "../models/event.model.js";
import SupplierRequest from "../models/request.model.js";
import Payment from "../models/payment.model.js";
import Contract from "../models/contract.model.js";

export const DashboardRepository ={
  async getContractsIdsForUser(clientId) {
    const contracts = await Contract.find({ clientId }).select("_id").lean();
    return contracts.map((c) => c._id);
  },

  async getContractsIdsForSupplier(supplierId) {
    const contracts = await Contract.find({ supplierId }).select("_id").lean();
    return contracts.map((c) => c._id);
  }
,
  async findUpcomingEventsForUser(ownerId, daysAhead = 60) {
    const now = new Date();
    const limit = new Date();
    limit.setDate(limit.getDate() + daysAhead);

    return Event.find({
      ownerId,
      status: { $in: ["תכנון", "פעיל"] },
      date: { $gte: now, $lte: limit },
    })
      .sort({ date: 1 })
      .lean();
  }
,
  async findUpcomingEventsForSupplier(supplierId, daysAhead = 60) {
    const now = new Date();
    const limit = new Date();
    limit.setDate(limit.getDate() + daysAhead);

    const contracts = await Contract.find({
      supplierId,
    })
      .populate({
        path: "eventId",
        match: {
          date: { $gte: now, $lte: limit },
          status: { $in: ["תכנון", "פעיל"] },
        },
      })
      .lean();

    const events = contracts
      .map((c) => c.eventId)
      .filter((e) => e && e.date);

    return events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

,
  async countPendingRequestsForUser(clientId) {
    return SupplierRequest.countDocuments({
      clientId,
      status: "ממתין",
    });
  }
,
  async countApprovedRequestsForUser(clientId) {
    return SupplierRequest.countDocuments({
      clientId,
      status: "מאושר",
    });
  }
,
  async countPendingRequestsForSupplier(supplierId) {
    return SupplierRequest.countDocuments({
      supplierId,
      status: "ממתין",
    });
  }
,
  async countApprovedRequestsForSupplier(supplierId) {
    return SupplierRequest.countDocuments({
      supplierId,
      status: "מאושר",
    });
  }
,

  async countActiveContractsForUser(clientId) {
    return Contract.countDocuments({
      clientId,
      status: "פעיל",
    });
  }
,
  async countActiveContractsForSupplier(supplierId) {
    return Contract.countDocuments({
      supplierId,
      status: "פעיל",
    });
  }
,

  async findPendingPaymentsForUser(clientId) {
    const contractIds = await this.getContractsIdsForUser(clientId);
    if (!contractIds.length) return [];

    return Payment.find({
      contractId: { $in: contractIds },
      status: "pending",
    }).lean();
  }
,
  async findPendingPaymentsForSupplier(supplierId) {
    const contractIds = await this.getContractsIdsForSupplier(supplierId);
    if (!contractIds.length) return [];

    return Payment.find({
      contractId: { $in: contractIds },
      status: "pending",
    }).lean();
  }
,
  async countPendingPaymentsForUser(clientId) {
    const contractIds = await this.getContractsIdsForUser(clientId);
    if (!contractIds.length) return 0;

    return Payment.countDocuments({
      contractId: { $in: contractIds },
      status: "pending",
    });
  }
,
  async countPendingPaymentsForSupplier(supplierId) {
    const contractIds = await this.getContractsIdsForSupplier(supplierId);
    if (!contractIds.length) return 0;

    return Payment.countDocuments({
      contractId: { $in: contractIds },
      status: "pending",
    });
  }
,
  async countOverduePaymentsForUser(clientId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const contractIds = await this.getContractsIdsForUser(clientId);
    if (!contractIds.length) return 0;

    return Payment.countDocuments({
      contractId: { $in: contractIds },
      status: "pending",
      dueDate: { $lt: today },
    });
  },

  async countOverduePaymentsForSupplier(supplierId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const contractIds = await this.getContractsIdsForSupplier(supplierId);
    if (!contractIds.length) return 0;

    return Payment.countDocuments({
      contractId: { $in: contractIds },
      status: "pending",
      dueDate: { $lt: today },
    });
  }
,
  async countPaidPaymentsForUser(clientId) {
    const contractIds = await this.getContractsIdsForUser(clientId);
    if (!contractIds.length) return 0;

    return Payment.countDocuments({
      contractId: { $in: contractIds },
      status: "paid",
    });
  }
,
  async countPaidPaymentsForSupplier(supplierId) {
    const contractIds = await this.getContractsIdsForSupplier(supplierId);
    if (!contractIds.length) return 0;

    return Payment.countDocuments({
      contractId: { $in: contractIds },
      status: "paid",
    });
  }
}


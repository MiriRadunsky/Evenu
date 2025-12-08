import Event from "../models/event.model.js";
import SupplierRequest from "../models/request.model.js";
import Payment from "../models/payment.model.js";
import Contract from "../models/contract.model.js";

export const DashboardRepository = {
  async getContractsIdsForUser(clientId) {
    const contracts = await Contract.find({ clientId }).select("_id").lean();
    return contracts.map((c) => c._id);
  },

  async getContractsIdsForSupplier(supplierId) {
    const contracts = await Contract.find({ supplierId }).select("_id").lean();
    return contracts.map((c) => c._id);
  },
  async findUpcomingEventsForUser(ownerId, daysAhead = 60) {
    const now = new Date();
    const limit = new Date();
    limit.setDate(limit.getDate() + daysAhead);

    return Event.find({
      ownerId,
      date: { $gte: now, $lte: limit },
    }).sort({ date: 1 });
  },
  async findUpcomingEventsForSupplier(supplierId, daysAhead = 60) {
    const now = new Date();
    const limit = new Date();
    limit.setDate(limit.getDate() + daysAhead);

    const contracts = await Contract.find({
      supplierId,
    }).populate({
      path: "eventId",
      match: {
        date: { $gte: now, $lte: limit },
      },
    });

    const events = contracts.map((c) => c.eventId).filter((e) => e && e.date);

    return events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  },

  async countPendingRequestsForUser(clientId) {
    return SupplierRequest.countDocuments({
      clientId,
      status: "ממתין",
    });
  },
  async countApprovedRequestsForUser(clientId) {
    return SupplierRequest.countDocuments({
      clientId,
      status: "מאושר",
    });
  },
  async countPendingRequestsForSupplier(supplierId) {
    return SupplierRequest.countDocuments({
      supplierId,
      status: "ממתין",
    });
  },
  async countApprovedRequestsForSupplier(supplierId) {
    return SupplierRequest.countDocuments({
      supplierId,
      status: "מאושר",
    });
  },
  async countActiveContractsForUser(clientId) {
    return Contract.countDocuments({
      clientId,
      status: "פעיל",
    });
  },
  async countActiveContractsForSupplier(supplierId) {
    return Contract.countDocuments({
      supplierId,
      status: "פעיל",
    });
  },
  async findPendingPaymentsForUser(clientId) {
    const contractIds = await this.getContractsIdsForUser(clientId);
    if (!contractIds.length) return [];

    return Payment.find({
      contractId: { $in: contractIds },
      status: "ממתין",
    }).lean();
  },
  async findPendingPaymentsForSupplier(supplierId) {
    const contractIds = await this.getContractsIdsForSupplier(supplierId);
    if (!contractIds.length) return [];

    return Payment.find({
      contractId: { $in: contractIds },
      status: "ממתין",
    }).lean();
  },
  async countPendingPaymentsForUser(clientId) {
    const contractIds = await this.getContractsIdsForUser(clientId);
    if (!contractIds.length) return 0;

    return Payment.countDocuments({
      contractId: { $in: contractIds },
      status: "ממתין",
    });
  },
  async countPendingPaymentsForSupplier(supplierId) {
    const contractIds = await this.getContractsIdsForSupplier(supplierId);
    if (!contractIds.length) return 0;

    return Payment.countDocuments({
      contractId: { $in: contractIds },
      status: "ממתין",
    });
  },
  async countOverduePaymentsForUser(clientId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const contractIds = await this.getContractsIdsForUser(clientId);
    if (!contractIds.length) return 0;

    return Payment.countDocuments({
      contractId: { $in: contractIds },
      status: "ממתין",
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
      status: "ממתין",
      dueDate: { $lt: today },
    });
  },
  async countPaidPaymentsForUser(clientId) {
    const contractIds = await this.getContractsIdsForUser(clientId);
    if (!contractIds.length) return 0;

    return Payment.countDocuments({
      contractId: { $in: contractIds },
      status: "שולם",
    });
  },
  async countPaidPaymentsForSupplier(supplierId) {
    const contractIds = await this.getContractsIdsForSupplier(supplierId);
    if (!contractIds.length) return 0;

    return Payment.countDocuments({
      contractId: { $in: contractIds },
      status: "שולם",
    });
  },

  // Admin dashboard functions
  async countTotalUsers() {
    const User = (await import("../models/user.model.js")).default;
    return User.countDocuments({ role: "user" });
  },

  async countTotalSuppliers() {
    const Supplier = (await import("../models/supplier.model.js")).default;
    return Supplier.countDocuments();
  },

  async countPendingSuppliers() {
    const Supplier = (await import("../models/supplier.model.js")).default;
    return Supplier.countDocuments({ status: "ממתין" });
  },

  async countTotalEvents() {
    return Event.countDocuments();
  },

  async countAllActiveContracts() {
    return Contract.countDocuments({ status: "פעיל" });
  },

  async getTotalRevenue() {
    const payments = await Payment.find({ status: "שולם" }).lean();
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  },
  async getPaidPaymentsForSupplier(supplierId, extraFilter = {}) {
    const contractIds = await this.getContractsIdsForSupplier(supplierId);
    if (!contractIds.length) return [];

    return Payment.find({
      contractId: { $in: contractIds },
      status: "שולם",
      ...extraFilter,
    }).lean();
  },
  async getPaidPaymentsForUser(clientId, filter = {}) {
    const contractIds = await this.getContractsIdsForUser(clientId);
    if (!contractIds.length) return [];

    return Payment.find({
      contractId: { $in: contractIds },
      status: "שולם",
      ...filter,
    }).lean();
  },

  async getAllPaymentsForUser(clientId, filter = {}) {
    const contractIds = await this.getContractsIdsForUser(clientId);
    if (!contractIds.length) return [];

    return Payment.find({
      contractId: { $in: contractIds },
      ...filter,
    }).lean();
  },

};

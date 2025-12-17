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

  // Admin dashboard statistics
  async getMonthlyEventsStats() {
    const currentYear = new Date().getFullYear();
    const months = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];

    const result = await Event.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31, 23, 59, 59)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const monthlyData = months.map((month, index) => {
      const data = result.find(r => r._id === index + 1);
      return {
        month,
        events: data ? data.count : 0
      };
    });

    return monthlyData;
  },

  async getSuppliersByCategory() {
    const Supplier = (await import('../models/supplier.model.js')).default;
    const Category = (await import('../models/category.model.js')).default;

    const result = await Supplier.aggregate([
      {
        $match: {
          status: { $in: ['מאושר', 'פעיל'] }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: {
          path: '$categoryInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$categoryInfo.label',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          category: { $ifNull: ['$_id', 'אחר'] },
          value: 1
        }
      },
      {
        $sort: { value: -1 }
      }
    ]);

    return result;
  },

  async getRecentSuppliers(limit = 5) {
    const Supplier = (await import('../models/supplier.model.js')).default;
    const Category = (await import('../models/category.model.js')).default;

    const suppliers = await Supplier.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('category', 'label')
      .populate('user', 'name email')
      .lean();

    return suppliers.map(s => ({
      name: s.user?.name || s.user?.email || 'לא ידוע',
      category: s.category?.label || 'לא מוגדר',
      date: s.createdAt
    }));
  },

  async getRecentEvents(limit = 5) {
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return events.map(e => ({
      name: e.name || 'אירוע ללא שם',
      date: e.createdAt
    }));
  },

};

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
      status: "ממתין",
    }).lean();
  }
,
  async findPendingPaymentsForSupplier(supplierId) {
    const contractIds = await this.getContractsIdsForSupplier(supplierId);
    if (!contractIds.length) return [];

    return Payment.find({
      contractId: { $in: contractIds },
      status: "ממתין",
    }).lean();
  }
,
  async countPendingPaymentsForUser(clientId) {
    const contractIds = await this.getContractsIdsForUser(clientId);
    if (!contractIds.length) return 0;

    return Payment.countDocuments({
      contractId: { $in: contractIds },
      status: "ממתין",
    });
  }
,
  async countPendingPaymentsForSupplier(supplierId) {
    const contractIds = await this.getContractsIdsForSupplier(supplierId);
    if (!contractIds.length) return 0;

    return Payment.countDocuments({
      contractId: { $in: contractIds },
      status: "ממתין",
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
  }
,
  async countPaidPaymentsForUser(clientId) {
    const contractIds = await this.getContractsIdsForUser(clientId);
    if (!contractIds.length) return 0;

    return Payment.countDocuments({
      contractId: { $in: contractIds },
      status: "שולם",
    });
  }
,
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
    const User = (await import('../models/user.model.js')).default;
    return User.countDocuments({ role: 'user' });
  },
  
  async countTotalSuppliers() {
    const Supplier = (await import('../models/supplier.model.js')).default;
    return Supplier.countDocuments();
  },
  
  async countPendingSuppliers() {
    const Supplier = (await import('../models/supplier.model.js')).default;
    return Supplier.countDocuments({ status: 'ממתין' });
  },
  
  async countTotalEvents() {
    return Event.countDocuments();
  },
  
  async countAllActiveContracts() {
    return Contract.countDocuments({ status: 'פעיל' });
  },
  
  async getTotalRevenue() {
    const payments = await Payment.find({ status: 'שולם' }).lean();
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  },
  
  // Admin stats for charts
  async getMonthlyEventsStats() {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);
    
    const events = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          events: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
    const eventsByMonth = Array.from({ length: 12 }, (_, i) => ({
      month: months[i],
      events: 0
    }));
    
    events.forEach(item => {
      if (item._id >= 1 && item._id <= 12) {
        eventsByMonth[item._id - 1].events = item.events;
      }
    });
    
    return eventsByMonth;
  },
  
  async getSuppliersByCategory() {
    const Supplier = (await import('../models/supplier.model.js')).default;
    
    const result = await Supplier.aggregate([
      {
        $match: {
          status: { $in: ['מאושר', 'בהמתנה'] }
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
        $sort: { value: -1 }
      }
    ]);
    
    return result.map(item => ({
      category: item._id || 'אחר',
      value: item.value
    }));
  },
  
  async getRecentSuppliers(limit = 5) {
    const Supplier = (await import('../models/supplier.model.js')).default;
    const User = (await import('../models/user.model.js')).default;
    const Category = (await import('../models/category.model.js')).default;
    
    const suppliers = await Supplier.find({ status: 'מאושר' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name')
      .populate('category', 'name')
      .lean();
    
    return suppliers.map(s => ({
      name: s.user?.name || 'לא ידוע',
      category: s.category?.name || 'אחר',
      date: s.createdAt
    }));
  },
  
  async getRecentEvents(limit = 5) {
    const User = (await import('../models/user.model.js')).default;
    
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('ownerId', 'name')
      .lean();
    
    return events.map(e => ({
      name: e.name || `אירוע - ${e.ownerId?.name || 'לא ידוע'}`,
      date: e.createdAt
    }));
  }
}


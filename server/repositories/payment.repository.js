import Payment from "../models/payment.model.js";
import Contract from "../models/contract.model.js";
function matchesSearch(payment, searchLower) {
  if (!searchLower) return true;

  const contract = payment.contractId;
  const eventName = contract?.eventId?.name || "";
  const clientName = contract?.clientId?.name || "";
  const supplierName =
    contract?.supplierId?.user?.name || contract?.supplierId?.name || "";

  const note = payment.note || "";
  const method = payment.method || "";

  const haystack = [eventName, clientName, supplierName, note, method]
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchLower);
}

export const PaymentRepository = {
  async create(contractId, data, session = null) {
    const payment = new Payment({
      contractId,
      amount: data.amount,
      dueDate: data.dueDate,
      note: data.note || "",
      method: data.method || undefined,
    });

    return payment.save({ session });
  },

  async update(paymentId, data) {
    return Payment.findByIdAndUpdate(paymentId, data, {
      new: true,
    });
  },

  async getById(paymentId) {
    return Payment.findById(paymentId);
  },
  async getByIdWithContract(paymentId) {
    return Payment.findById(paymentId).populate({
      path: "contractId",
      populate: [
        { path: "eventId" },
        { path: "clientId" },
        {
          path: "supplierId",
          populate: { path: "user" },
        },
      ],
    });
  },
  async getByContract(contractId) {
    return Payment.find({ contractId }).sort({ dueDate: 1 });
  },
  async findPaymentsForClient(clientUserId) {
    // חוזים של הלקוח (clientId זה ה־User או entity – תלוי במודל שלך)
    const contracts = await Contract.find({ clientId: clientUserId })
      .select("_id")
      .lean();

    const contractIds = contracts.map((c) => c._id);
    if (!contractIds.length) return [];

    return Payment.find({ contractId: { $in: contractIds } })
      .populate({
        path: "contractId",
        populate: [
          { path: "eventId" },
          {
            path: "supplierId",
            populate: { path: "user" },
          },
          { path: "clientId" },
        ],
      })
      .sort({ dueDate: 1 });
  },
  async findPaymentsForSupplier(supplierId) {
    const contracts = await Contract.find({ supplierId }).select("_id").lean();

    const contractIds = contracts.map((c) => c._id);
    if (!contractIds.length) return [];

    return Payment.find({ contractId: { $in: contractIds } })
      .populate({
        path: "contractId",
        populate: [
          { path: "eventId" },
          { path: "clientId" },
          {
            path: "supplierId",
            populate: { path: "user" },
          },
        ],
      })
      .sort({ dueDate: 1 });
  },
  _buildSummaryFromPayments(payments) {
    const now = new Date();

    let pendingPaymentsCount = 0;
    let pendingPaymentsTotal = 0;
    let overduePaymentsCount = 0;
    let paidPaymentsCount = 0;

    for (const p of payments) {
      if (!p) continue;

      if (p.status === "שולם") {
        paidPaymentsCount += 1;
      }

      if (p.status === "ממתין") {
        pendingPaymentsCount += 1;
        pendingPaymentsTotal += p.amount || 0;
        if (p.dueDate && p.dueDate < now) {
          overduePaymentsCount += 1;
        }
      }
    }

    return {
      pendingPaymentsCount,
      pendingPaymentsTotal,
      overduePaymentsCount,
      paidPaymentsCount,
    };
  },
  async getSummaryForClient(clientUserId) {
    const payments = await this.findPaymentsForClient(clientUserId);
    return this._buildSummaryFromPayments(payments);
  },
  async getSummaryForSupplier(supplierId) {
    const payments = await this.findPaymentsForSupplier(supplierId);
    return this._buildSummaryFromPayments(payments);
  },
  async delete(paymentId) {
    return Payment.findByIdAndDelete(paymentId);
  },
  async findPaymentsForClientPaged({
    clientUserId,
    page = 1,
    limit = 10,
    status,
    eventId,
    search,
  }) {
    const contractQuery = { clientId: clientUserId };

    if (eventId) {
      contractQuery.eventId = eventId;
    }

    const contracts = await Contract.find(contractQuery).select("_id").lean();
    const contractIds = contracts.map((c) => c._id);
    if (!contractIds.length) {
      return {
        items: [],
        total: 0,
        page,
        pageSize: limit,
        totalPages: 0,
      };
    }

    const paymentQuery = { contractId: { $in: contractIds } };

    if (status) {
      paymentQuery.status = status;
    }

    const allPayments = await Payment.find(paymentQuery)
      .populate({
        path: "contractId",
        populate: [
          { path: "eventId" },
          {
            path: "supplierId",
            populate: { path: "user" },
          },
          { path: "clientId" },
        ],
      })
      .sort({ dueDate: 1 });

    const searchLower = search ? String(search).toLowerCase() : "";
    const filtered = searchLower
      ? allPayments.filter((p) => matchesSearch(p, searchLower))
      : allPayments;

    const total = filtered.length;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages,
    };
  },
  async findPaymentsForSupplierPaged({
    supplierId,
    page = 1,
    limit = 10,
    status,
    eventId,
    search,
  }) {
    const contractQuery = { supplierId };

    if (eventId) {
      contractQuery.eventId = eventId;
    }

    const contracts = await Contract.find(contractQuery).select("_id").lean();
    const contractIds = contracts.map((c) => c._id);
    if (!contractIds.length) {
      return {
        items: [],
        total: 0,
        page,
        pageSize: limit,
        totalPages: 0,
      };
    }

    const paymentQuery = { contractId: { $in: contractIds } };

    if (status) {
      paymentQuery.status = status;
    }

    const allPayments = await Payment.find(paymentQuery)
      .populate({
        path: "contractId",
        populate: [
          { path: "eventId" },
          { path: "clientId" },
          {
            path: "supplierId",
            populate: { path: "user" },
          },
        ],
      })
      .sort({ dueDate: 1 });

    const searchLower = search ? String(search).toLowerCase() : "";
    const filtered = searchLower
      ? allPayments.filter((p) => matchesSearch(p, searchLower))
      : allPayments;

    const total = filtered.length;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages,
    };
  },
};

// import { populate } from 'dotenv';
// import Contract from '../models/contract.model.js';
// import Payment from "../models/payment.model.js";

// export const PaymentRepository = {
//   // יצירת תשלום חדש
//   async create(contractId, data, session = null) {
//   return Payment.create([{ contractId, ...data }], { session }).then(r => r[0]);
// }
// ,

//   // עדכון תשלום קיים
//   async update(paymentId, data) {
//     return Payment.findByIdAndUpdate(paymentId, data, { new: true });
//   },

//   // שליפת תשלום לפי מזהה
//   async getById(paymentId) {
//     return Payment.findById(paymentId);
//   },

//   // שליפת כל התשלומים לחוזה
//   async getByContract(contractId) {
//     return Payment.find({ contractId }).sort({ dueDate: 1 });
//   },

//   // תשלומים של לקוח (לפי userId שמופיע ב-contract.clientId)
//   async findPaymentsForClient(clientId) {
//     const contracts = await Contract.find({ clientId }).select('_id').lean();
//     const contractIds = contracts.map(c => c._id);

//     if (contractIds.length === 0) return [];

//     return Payment.find({ contractId: { $in: contractIds } })
//       .populate({
//         path: 'contractId',
//         populate: [
//           { path: 'eventId' },
//           { path: 'supplierId', populate: { path: 'user' } },
//           { path: 'clientId' },
//         ],
//       })
//       .sort({ dueDate: 1 })
//       .lean();
//   }
// ,
//   // תשלומים של ספק (לפי userId שמופיע ב-contract.supplierId)
//   async findPaymentsForSupplier(supplierId) {
//     const contracts = await Contract.find({ supplierId }).select('_id').lean();
//     const contractIds = contracts.map(c => c._id);

//     if (contractIds.length === 0) return [];

//     return Payment.find({ contractId: { $in: contractIds } })
//       .populate({
//         path: 'contractId',
//         populate: [
//           { path: 'eventId' },
//           { path: 'supplierId' ,populate: { path: 'user' }},
//           { path: 'clientId' },
//         ],
//       })
//       .sort({ dueDate: 1 })
//       .lean();
//   }
// ,
//   // סיכומים ללקוח
//   async getSummaryForClient(clientId) {
//     const payments = await this.findPaymentsForClient(clientId)
//     return this._buildSummaryFromPayments(payments);
//   }
// ,
//   // סיכומים לספק
//   async getSummaryForSupplier(supplierId) {
//     const payments = await this.findPaymentsForSupplier(supplierId);
//     return this._buildSummaryFromPayments(payments);
//   }
// ,
//   _buildSummaryFromPayments(payments) {
//     const now = new Date();
//     let pendingPaymentsCount = 0;
//     let pendingPaymentsTotal = 0;
//     let overduePaymentsCount = 0;
//     let paidPaymentsCount = 0;

//     for (const p of payments) {
//       if (p.status === 'ממתין') {
//         pendingPaymentsCount++;
//         pendingPaymentsTotal += p.amount || 0;

//         const due = p.dueDate ? new Date(p.dueDate) : null;
//         if (due && due < now) {
//           overduePaymentsCount++;
//         }
//       }

//       if (p.status === 'שולם') {
//         paidPaymentsCount++;
//       }
//     }

//     return {
//       pendingPaymentsCount,
//       pendingPaymentsTotal,
//       overduePaymentsCount,
//       paidPaymentsCount,
//     };
//   }
// ,

//   // מחיקת תשלום
//   async delete(paymentId) {
//     return Payment.findByIdAndDelete(paymentId);
//   }
// };
// repositories/payment.repository.js
import Payment from "../models/payment.model.js";
import Contract from "../models/contract.model.js";

export const PaymentRepository= {
  // יצירת תשלום חדש
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

  // עדכון לפי ID
  async update(paymentId, data) {
    return Payment.findByIdAndUpdate(paymentId, data, {
      new: true,
    });
  },

  async getById(paymentId) {
    return Payment.findById(paymentId);
  }
,
  async getByIdWithContract(paymentId) {
    return Payment.findById(paymentId)
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
      });
  }
,
  async getByContract(contractId) {
    return Payment.find({ contractId }).sort({ dueDate: 1 });
  }
,
  // --------- ל־"התשלומים שלי" (לקוח) ---------
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
  }
,
  // --------- ל־"התשלומים שלי" (ספק) ---------
  async findPaymentsForSupplier(supplierId) {
    const contracts = await Contract.find({ supplierId })
      .select("_id")
      .lean();

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
  }
,
  // --------- סיכומים ל־summary ---------
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
  }
,
  async getSummaryForClient(clientUserId) {
    const payments = await this.findPaymentsForClient(clientUserId);
    return this._buildSummaryFromPayments(payments);
  }
,
  async getSummaryForSupplier(supplierId) {
    const payments = await this.findPaymentsForSupplier(supplierId);
    return this._buildSummaryFromPayments(payments);
  }
,
  async delete(paymentId) {
    return Payment.findByIdAndDelete(paymentId);
  }
}

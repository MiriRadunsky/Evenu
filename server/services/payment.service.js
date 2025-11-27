// import moment from "moment-timezone";
// import { PaymentRepository } from "../repositories/payment.repository.js";
// import { NotificationService } from "./notification.service.js";
// import {SupplierRepository} from "../repositories/suppliers.repositry.js";
// import { AppError } from "../middlewares/error.middleware.js";
// export const PaymentService = {


//   async createPayment(contractId, data, session = null, userId) {    
//     const payment = await PaymentRepository.create(contractId, data, session);
//     const payloadTime = new Date(); // עכשיו
//     const dueDate = moment.tz(payment.dueDate, "Asia/Jerusalem").toDate();
//     const reminderBeforeMinutes = 60; // לדוגמה, התראה שעה לפני
//     const reminderDate = moment(dueDate)
//       .subtract(reminderBeforeMinutes, "minutes")
//       .toDate();
    
//     // התראה רגילה בזמן התשלום
//     await NotificationService.createNotification({
//       userId,
//       type: "payment",
//       payload: {
//         contractId,
//         paymentId: payment._id,
//         amount: payment.amount,
//         note: payment.note,
//         time: payloadTime,
//       },
//       scheduledFor: dueDate,
//     });

//     // התראה מוקדמת
//     // await NotificationService.createNotification({
//     //   userId,
//     //   type: "payment_due_reminder",
//     //   payload: {
//     //     contractId,
//     //     paymentId: payment._id,
//     //     amount: payment.amount,
//     //     note: payment.note,
//     //     time: payloadTime,
//     //   },
//     //   scheduledFor: reminderDate,
//     // });
    
//     return payment;
//   },
//   // עדכון תשלום (למשל שינוי סטטוס)
//   async updatePayment(paymentId, data) {
//     return PaymentRepository.update(paymentId, data);
//   },

//   // שליפת תשלום
//   async getPaymentById(id) {
//     return PaymentRepository.getById(id);
//   },

//   // כל התשלומים לחוזה
//   async getPaymentsByContract(contractId) {
//     return PaymentRepository.getByContract(contractId);
//   },
//   async getClientPayments(userId) {
//     const [payments, summary] = await Promise.all([
//       PaymentRepository.findPaymentsForClient(userId),
//       PaymentRepository.getSummaryForClient(userId),
//     ]);

//     return { payments, summary };
//   }
// ,
//   async getSupplierPayments(userId) {
//   const supplierId = await SupplierRepository.getSupplierIdByUserId(userId);
//     const [payments, summary] = await Promise.all([
//       PaymentRepository.findPaymentsForSupplier(supplierId),
//       PaymentRepository.getSummaryForSupplier(supplierId),
//     ]);

//     return { payments, summary };
//   },
//   // services/payment.service.js
// async markPaymentAsPaid(paymentId, { method, note, paidAt }) {
//   const payment = await PaymentRepository.getById(paymentId);  
//   if (!payment) throw new AppError(404, 'תשלום לא נמצא');

//   payment.status = 'שולם';
//   payment.method = method || 'other';
//   payment.paidAt = paidAt || new Date();
//   if (note) payment.note = note;

//   await payment.save();

//   // אפשר לשלוח פה התראה ללקוח/ספק
//   // await NotificationService.createNotification(...);

//   return payment;
// }
// ,
//   // מחיקת תשלום
//   async deletePayment(id) {
//     return PaymentRepository.delete(id);
//   },
// };

// services/payment.service.js
import moment from "moment-timezone";
import { PaymentRepository } from "../repositories/payment.repository.js";
import { NotificationService } from "./notification.service.js";
import { SupplierRepository } from "../repositories/suppliers.repositry.js";
import { AppError } from "../middlewares/error.middleware.js";


export const PaymentService = {
  // ---------- יצירה רגילה של תשלום לחוזה ----------
  async createPayment(contractId, data, session = null, userId = null) {
    const payment = await PaymentRepository.create(contractId, data, session);

    // התראה עתידית על תשלום (אם תרצי)
    if (userId && payment.dueDate) {
      const dueDate = moment
        .tz(payment.dueDate, "Asia/Jerusalem")
        .toDate();

      await NotificationService.createNotification({
        userId,
        type: "payment",
        payload: {
          contractId,
          paymentId: payment._id,
          amount: payment.amount,
          note: payment.note,
          time: new Date(),
        },
        scheduledFor: dueDate,
      });
    }

    return payment;
  },

  async updatePayment(paymentId, data) {
    const updated = await PaymentRepository.update(paymentId, data);
    if (!updated) {
      throw new AppError(404, "תשלום לא נמצא");
    }
    return updated;
  },

  async getPaymentById(paymentId) {
    const payment = await PaymentRepository.getByIdWithContract(paymentId);
    if (!payment) {
      throw new AppError(404, "תשלום לא נמצא");
    }
    return payment;
  },

  async getPaymentsByContract(contractId) {
    return PaymentRepository.getByContract(contractId);
  },

  // ---------- צד לקוח: "התשלומים שלי" ----------
  async getClientPayments(userId) {
    const [payments, summary] = await Promise.all([
      PaymentRepository.findPaymentsForClient(userId),
      PaymentRepository.getSummaryForClient(userId),
    ]);

    return { payments, summary };
  },

  // ---------- צד ספק: "התשלומים שלי" ----------
  async getSupplierPayments(userId) {
 
    const supplierId = await SupplierRepository.getSupplierIdByUserId(
      userId
    );

    if (!supplierId) {
      throw new AppError(404, "לא נמצא ספק עבור משתמש זה");
    }

    const [payments, summary] = await Promise.all([
      PaymentRepository.findPaymentsForSupplier(supplierId),
      PaymentRepository.getSummaryForSupplier(supplierId),
    ]);

    return { payments, summary };
  },

  // --------------------------------------------------
  //  לקוח: דיווח "שילמתי"  (status נשאר "ממתין")
  // --------------------------------------------------
  async clientReportPaid({ paymentId, user, method, note, documentKey }) {
    
    const payment = await PaymentRepository.getByIdWithContract(paymentId);
    if (!payment) {
      throw new AppError(404, "תשלום לא נמצא");
    }

    const contract = payment.contractId;
    if (!contract) {
      throw new AppError(400, "לתשלום אין חוזה משויך");
    }

    // ודא שהמשתמש הוא הלקוח של החוזה
    if (String(contract.clientId?._id || contract.clientId) !== String(user._id)) {
      throw new AppError(403, "אין לך הרשאה לדווח על תשלום זה");
    }
    if(payment.status === "ממתין לספק") {
        throw new AppError(400, "תשלום זה כבר סומן כממתין לספק");
    }
    if (payment.status === "שולם") {
      throw new AppError(400, "תשלום זה כבר סומן כשולם");
    }
    if (payment.status === "נדחה") {
      throw new AppError(
        400,
        "תשלום נדחה – יש ליצור קשר עם הספק / תמיכה"
      );
    }

    const updated = await PaymentRepository.update(paymentId, {
      method: method || payment.method,
      note: note ?? payment.note,
      clientEvidenceKey: documentKey || payment.documentKey,
      clientReportedPaidAt: new Date(),
      clientReportedBy: user._id,
      status: "ממתין לספק",
    });

    // התראה לספק
    const supplierUserId =
      contract.supplierId?.user?._id || contract.supplierId?.user;

    if (supplierUserId) {
      await NotificationService.createNotification({
        userId: supplierUserId,
        type: "payment_reported",
        payload: {
          paymentId: updated._id,
          contractId: contract._id,
          amount: updated.amount,
          note: updated.note,
          clientName: contract.clientId?.name,
          time: new Date(),
        },
        channel: "in-app",
      });
    }

    return updated;
  },

  // --------------------------------------------------
  //  ספק: מאשר ששולם
  // --------------------------------------------------
  async supplierConfirmPaid({ paymentId, user, method, note, documentKey }) {
    const payment = await PaymentRepository.getByIdWithContract(paymentId);
    if (!payment) {
      throw new AppError(404, "תשלום לא נמצא");
    }

    const contract = payment.contractId;
    if (!contract) {
      throw new AppError(400, "לתשלום אין חוזה משויך");
    }

    const supplierId = await SupplierRepository.getSupplierIdByUserId(
      user._id
    );
    if (!supplierId) {
      throw new AppError(403, "לא נמצא ספק עבור משתמש זה");
    }

    if (String(contract.supplierId?._id || contract.supplierId) !== String(supplierId)) {
      throw new AppError(403, "אין לך הרשאה לאשר תשלום זה");
    }

    if (payment.status === "שולם") {
      throw new AppError(400, "תשלום זה כבר סומן כשולם");
    }

    const now = new Date();

    const updated = await PaymentRepository.update(paymentId, {
      status: "שולם",
      paidAt: now,
      method: method || payment.method,
      note: note ?? payment.note,
      supplierEvidenceKey: documentKey || payment.documentKey,
      supplierConfirmedPaidAt: now,
      supplierConfirmedBy: user._id,
      rejectedReason: undefined,
    });

    // התראה ללקוח
    const clientUserId = contract.clientId?._id || contract.clientId;
    if (clientUserId) {
      await NotificationService.createNotification({
        userId: clientUserId,
        type: "payment_approved",
        payload: {
          paymentId: updated._id,
          contractId: contract._id,
          amount: updated.amount,
          note: updated.note,
          time: new Date(),
        },
        channel: "in-app",
      });
    }

    return updated;
  },

  // --------------------------------------------------
  //  ספק: דוחה תשלום (למשל: "לא התקבלה העברה")
  // --------------------------------------------------
  async supplierRejectPaid({ paymentId, user, reason }) {
    if (!reason || !reason.trim()) {
      throw new AppError(400, "יש לציין סיבת דחייה");
    }

    const payment = await PaymentRepository.getByIdWithContract(paymentId);
    if (!payment) {
      throw new AppError(404, "תשלום לא נמצא");
    }

    const contract = payment.contractId;
    if (!contract) {
      throw new AppError(400, "לתשלום אין חוזה משויך");
    }

    const supplierId = await SupplierRepository.getSupplierIdByUserId(
      user._id
    );
    if (!supplierId) {
      throw new AppError(403, "לא נמצא ספק עבור משתמש זה");
    }

    if (String(contract.supplierId?._id || contract.supplierId) !== String(supplierId)) {
      throw new AppError(403, "אין לך הרשאה לדחות תשלום זה");
    }

    const updated = await PaymentRepository.update(paymentId, {
      status: "נדחה",
      rejectedReason: reason,
      supplierConfirmedPaidAt: undefined,
      supplierConfirmedBy: undefined,
      paidAt: undefined,
    });

    const clientUserId = contract.clientId?._id || contract.clientId;
    if (clientUserId) {
      await NotificationService.createNotification({
        userId: clientUserId,
        type: "payment_rejected",
        payload: {
          paymentId: updated._id,
          contractId: contract._id,
          amount: updated.amount,
          reason,
          time: new Date(),
        },
        channel: "in-app",
      });
    }

    return updated;
  },

  async deletePayment(paymentId) {
    const deleted = await PaymentRepository.delete(paymentId);
    if (!deleted) {
      throw new AppError(404, "תשלום לא נמצא");
    }
    return deleted;
  },
};

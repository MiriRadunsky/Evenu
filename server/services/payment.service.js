import moment from "moment-timezone";
import { PaymentRepository } from "../repositories/payment.repository.js";
import { NotificationService } from "./notification.service.js";
import { SupplierRepository } from "../repositories/suppliers.repositry.js";
import { AppError } from "../middlewares/error.middleware.js";

const ALLOWED_METHODS = ["העברה בנקית", "מזומן", "כרטיס אשראי", "צק", "אחר"];

function validateCreatePaymentData(method) {
  if (method && !ALLOWED_METHODS.includes(method)) {
    throw new AppError(400, "אמצעי התשלום שהוזן אינו תקין");
  }
}
function validateClientReport(payment) {
  if (payment.status === "ממתין לספק") {
    throw new AppError(400, "תשלום זה כבר סומן כממתין לספק");
  }
  if (payment.status === "שולם") {
    throw new AppError(400, "תשלום זה כבר סומן כשולם");
  }
  if (payment.status === "נדחה") {
    throw new AppError(400, "תשלום נדחה – יש ליצור קשר עם הספק או עם התמיכה");
  }
}

function validateSupplierConfirm(payment) {
  if (payment.status === "שולם") {
    throw new AppError(400, "תשלום זה כבר סומן כשולם");
  }
  if (payment.status === "נדחה") {
    throw new AppError(400, "לא ניתן לאשר תשלום שנדחה");
  }
}

export const PaymentService = {
  async createPayment(contractId, data, session = null, userId = null) {
    validateCreatePaymentData(data.method);

    const payment = await PaymentRepository.create(contractId, data, session);

    if (userId && payment.dueDate) {
      const dueDate = moment.tz(payment.dueDate, "Asia/Jerusalem").toDate();

      await NotificationService.createNotification({
        userId,
        type: "תשלום",
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
    validateCreatePaymentData(data.method);

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

  async getClientPayments(
    userId,
    { page = 1, limit = 10, status, eventId ,searchTerm} = {}
  ) {
    const [pageData, summary] = await Promise.all([
      PaymentRepository.findPaymentsForClientPaged({
        clientUserId: userId,
        page,
        limit,
        status,
        eventId,
        search:searchTerm
      }),
      PaymentRepository.getSummaryForClient(userId),
    ]);

    return {
      ...pageData,
      summary,
    };
  },

  async getSupplierPayments(
    userId,
    { page = 1, limit = 10, status, eventId, searchTerm } = {}
  ) {
    const supplierId = await SupplierRepository.getSupplierIdByUserId(userId);

    if (!supplierId) {
      throw new AppError(404, "לא נמצא ספק עבור משתמש זה");
    }

    const [pageData, summary] = await Promise.all([
      PaymentRepository.findPaymentsForSupplierPaged({
        supplierId,
        page,
        limit,
        status,
        eventId,
        search:searchTerm
      }),
      PaymentRepository.getSummaryForSupplier(supplierId),
    ]);

    return {
      ...pageData,
      summary,
    };
  },

  async clientReportPaid({ paymentId, user, method, note, documentKey }) {
    const payment = await PaymentRepository.getByIdWithContract(paymentId);
    if (!payment) {
      throw new AppError(404, "תשלום לא נמצא");
    }

    const contract = payment.contractId;
    if (!contract) {
      throw new AppError(400, "לתשלום אין חוזה משויך");
    }

    if (
      String(contract.clientId?._id || contract.clientId) !== String(user._id)
    ) {
      throw new AppError(403, "אין לך הרשאה לדווח על תשלום זה");
    }
    validateClientReport(payment);

    const updated = await PaymentRepository.update(paymentId, {
      method: method || payment.method,
      note: note ?? payment.note,
      clientEvidenceKey: documentKey || payment.documentKey,
      clientReportedPaidAt: new Date(),
      clientReportedBy: user._id,
      status: "ממתין לספק",
    });

    const supplierUserId =
      contract.supplierId?.user?._id || contract.supplierId?.user;

    if (supplierUserId) {
      await NotificationService.createNotification({
        userId: supplierUserId,
        type: "תשלום",
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

  async supplierConfirmPaid({ paymentId, user, method, note, documentKey }) {
    const payment = await PaymentRepository.getByIdWithContract(paymentId);
    if (!payment) {
      throw new AppError(404, "תשלום לא נמצא");
    }

    const contract = payment.contractId;
    if (!contract) {
      throw new AppError(400, "לתשלום אין חוזה משויך");
    }

    const supplierId = await SupplierRepository.getSupplierIdByUserId(user._id);
    if (!supplierId) {
      throw new AppError(403, "לא נמצא ספק עבור משתמש זה");
    }

    if (
      String(contract.supplierId?._id || contract.supplierId) !==
      String(supplierId)
    ) {
      throw new AppError(403, "אין לך הרשאה לאשר תשלום זה");
    }

    validateSupplierConfirm(payment);

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
        type: "תשלום",
        payload: {
          paymentId: updated._id,
          contractId: contract._id,
          amount: updated.amount,
          note: note,
          time: new Date(),
        },
        channel: "in-app",
      });
    }

    return updated;
  },

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

    const supplierId = await SupplierRepository.getSupplierIdByUserId(user._id);
    if (!supplierId) {
      throw new AppError(403, "לא נמצא ספק עבור משתמש זה");
    }

    if (
      String(contract.supplierId?._id || contract.supplierId) !==
      String(supplierId)
    ) {
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
        type: "תשלום",
        payload: {
          paymentId: updated._id,
          contractId: contract._id,
          amount: updated.amount,
          note: reason,
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

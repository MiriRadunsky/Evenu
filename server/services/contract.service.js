import * as repo from "../repositories/contract.repository.js";
import {
  createSignatureMetadata,
  verifyContractSignature,
} from "../utils/signature.utils.js";
import { SupplierRepository } from "../repositories/suppliers.repositry.js";
import {
  getContractById,
  updateContract,
} from "../repositories/contract.repository.js";
import { PaymentService } from "./payment.service.js";
import mongoose from "mongoose";
import { AppError } from "../middlewares/error.middleware.js";
import { NotificationService } from "./notification.service.js";
import { getEventById } from "../repositories/event.repository.js";
import { getUserById } from "../repositories/user.repository.js";
import { updateBudgetAllocated } from "./event.service.js";

function validateCreatePaymentData(data) {
  const { amount, dueDate, note } = data || {};
  console.log(data,amount, dueDate, note, isNaN(amount));
  
  // סכום
  if (amount == null || isNaN(amount)) {
    throw new AppError(400, "יש להזין סכום לתשלום");
  }
  if (amount <= 0) {
    throw new AppError(400, "סכום התשלום חייב להיות גדול מ-0");
  }

  // dueDate
  if (!dueDate) {
    throw new AppError(400, "יש להזין תאריך לתשלום");
  }
  const due = new Date(dueDate);
  if (isNaN(due.getTime())) {
    throw new AppError(400, "תאריך התשלום אינו תקין");
  }

  // (אופציונלי) לא לאפשר תשלום שמתוכנן עמוק בעבר
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (due < yesterday) {
    throw new AppError(400, "לא ניתן ליצור תשלום עם תאריך שעבר מזמן");
  }
  // הערה ארוכה מדי (אופציונלי)
  if (note && note.length > 1000) {
    throw new AppError(400, "הערת התשלום ארוכה מדי");
  }
}
export async function createContract(data, userId) {
  const { eventId, clientId } = data;

  const [event, client, supplier] = await Promise.all([
    getEventById(eventId, clientId),
    getUserById(clientId),
    SupplierRepository.getSupplierByUserId(userId),
  ]);

  if (!event) {
    throw new AppError(404, "האירוע לא נמצא");
  }

  if (event.date < new Date()) {
    throw new AppError(400, "לא ניתן ליצור חוזה לאירוע שכבר עבר");
  }

  if (!supplier) {
    throw new AppError(404, "הספק לא נמצא");
  }
  if (supplier.status !== "מאושר") {
    throw new AppError(400, "לא ניתן ליצור חוזה לספק שאינו מאושר");
  }

  if (!client) {
    throw new AppError(404, "הלקוח לא נמצא");
  }

  const existing = await repo.checkIfContractExists({
    eventId,
    supplierId: supplier._id,
    clientId,
    status: "טיוטה",
  });

  if (existing) {
    throw new AppError(400, "כבר קיים חוזה עבור האירוע");
  }
  data.paymentPlan&&data.paymentPlan.map((item) => validateCreatePaymentData(item));
  const paymentPlan = Array.isArray(data.paymentPlan) ? data.paymentPlan : [];
  const totalAmount = paymentPlan.reduce(
    (acc, item) => acc + (item.amount || 0),
    0
  );

  const contractData = {
    ...data,
    supplierId: supplier._id,
    totalAmount,
  };

  const contract = await repo.createContract(contractData);

  const totalAllocated = event.budgetAllocated ?? 0;
  const budget = event.budget ?? 0;
  const afterThisContract = totalAllocated + totalAmount;
  // console.log(
  //   "mount",
  //   paymentPlan,
  //   totalAmount,
  //   totalAllocated,
  //   budget,
  //   afterThisContract
  // );

  if (budget && afterThisContract > budget) {
    await NotificationService.createNotification({
      userId: contract.clientId?._id,
      type: "חוזה",
      payload: {
        contractId: contract._id,
        eventId: event._id,
        eventName: event.name,
        overBy: afterThisContract - budget,
        time: new Date().toISOString(),
        note: "נוצר חוזה חדש שחורג מהתקציב שהגדרת לאירוע. עדכני תקציב או בטלי את החוזה לפני חתימה.",
      },
      channel: "in-app",
    });
  } else {
    await NotificationService.createNotification({
      userId: contract.clientId?._id,
      type: "חוזה",
      payload: {
        contractId: contract._id,
        supplierId: supplier._id,
        eventId: event._id,
        eventName: event.name,
        time: new Date().toISOString(),
        note: "חוזה חדש נוצר עבור האירוע",
      },
      channel: "in-app",
    });
  }

  return contract;
}

export async function getContract(contractId) {
  const contract = await repo.getContractById(contractId);
  if (!contract) throw new AppError(404, "Contract not found");
  return contract;
}

export async function cancelContractService(contractId, userId, party) {
  const contract = await getContractById(contractId);
  if (!contract) throw new AppError(404, "חוזה לא נמצא");

  if (contract.status === "פעיל") {
    throw new AppError(400, "לא ניתן לבטל חוזה שכבר פעיל");
  }

  if (party === "supplier") {
    const suppllierId = await SupplierRepository.getSupplierIdByUserId(userId);
    if (!suppllierId) throw new AppError(404, "ספק לא נמצא");

    if (!contract.supplierId.equals(suppllierId)) {
      throw new AppError(403, "לא נמצא ספק עבור משתמש זה");
    }
  } else if (party === "client") {
    if (!contract.clientId.equals(userId)) {
      throw new AppError(403, "לא נמצא לקוח עבור משתמש זה");
    }
  } else {
    throw new AppError(400, "צד לא תקין");
  }

  const updatedContract = await updateContract(contractId, { status: "מבוטל" });
  return updatedContract;
}

export async function signContractService(
  contractId,
  user,
  party,
  signatureMeta = {},
  req,
  signatureData = null
) {
  if (!["client", "supplier"].includes(party)) {
    throw new AppError(400, "צד לא תקין");
  }

  const session = await mongoose.startSession();
  let committed = false;

  try {
    session.startTransaction();

    const contract = await repo.getContractById(contractId);
    if (!contract) throw new AppError(404, "חוזה לא נמצא");

  if (contract.eventId.date < new Date()) {
    throw new AppError(400, "לא ניתן ליצור חוזה לאירוע שכבר עבר");
  }

    const ipAddress = req?.ip || req?.connection?.remoteAddress || "unknown";
    const userAgent = req?.headers?.["user-agent"] || "unknown";

    const signatureMetadata = createSignatureMetadata(user._id, contractId, {
      eventId: contract.eventId,
      supplierId: contract.supplierId,
      clientId: contract.clientId,
      s3Key: contract.s3Key,
      paymentPlan: contract.paymentPlan,
    });

    let signatureS3Key = null;
    if (signatureData) {
      signatureS3Key = signatureData;
    }

    const supplierSignedNow = party === "supplier";
    const clientSignedNow = party === "client";

    if (party === "supplier") {
      if (contract.supplierSignature) {
        throw new AppError(400, "הספק כבר חתם על החוזה");
      }

      const supplierId = await SupplierRepository.getSupplierIdByUserId(
        user._id
      );
      if (!supplierId) {
        throw new AppError(404, "ספק לא נמצא");
      }
      contract.supplierSignature = {
        supplierId,
        signatureMeta: signatureMetadata,
        signatureS3Key,
        ipAddress,
        userAgent,
        at: new Date(),
      };
    }

    if (party === "client") {
      const alreadySigned = contract.clientSignatures.some(
        (sig) => String(sig.clientId?._id || sig.clientId) === String(user._id)
      );
      if (alreadySigned) {
        throw new AppError(400, "הלקוח כבר חתם על החוזה");
      }

      const eventId = contract.eventId._id || contract.eventId;
      const contractAmount = contract.totalAmount ?? 0;

      await updateBudgetAllocated(eventId, user._id, contractAmount, session);

      contract.clientSignatures.push({
        clientId: user._id,
        signatureMeta: signatureMetadata,
        signatureS3Key,
        ipAddress,
        userAgent,
        at: new Date(),
      });
    }

    const bothSigned =
      contract.supplierSignature && contract.clientSignatures.length > 0;

    if (bothSigned) {
      for (const payment of contract.paymentPlan) {
        await PaymentService.createPayment(
          contractId,
          {
            dueDate: payment.dueDate,
            amount: payment.amount,
            note: payment.note,
          },
          session,
          contract.clientId._id
        );
      }
    }

    await contract.save({ session });

    await session.commitTransaction();
    committed = true;

    if (supplierSignedNow) {
      await NotificationService.createNotification({
        userId: contract.clientId?._id,
        type: "חוזה",
        payload: {
          contractId: contract._id,
          eventId: contract.eventId._id,
          time: new Date().toISOString(),
          note: "הספק חתם על החוזה",
        },
        channel: "in-app",
      });
    }

    if (clientSignedNow) {
      const supplierUserId = contract.supplierId.user._id;

      await NotificationService.createNotification({
        userId: supplierUserId,
        type: "חוזה",
        payload: {
          contractId: contract._id,
          eventId: contract.eventId._id,
          time: new Date().toISOString(),
          note: "הלקוח חתם על החוזה",
        },
        channel: "in-app",
      });
    }

    if (bothSigned) {
      const supplierUserId = contract.supplierId.user._id;

      await NotificationService.createNotification({
        userId: contract.clientId?._id,
        type: "חוזה",
        payload: {
          contractId: contract._id,
          time: new Date().toISOString(),
          note: "החוזה פעיל וחתום על ידי שני הצדדים",
        },
        channel: "in-app",
      });

      await NotificationService.createNotification({
        userId: supplierUserId,
        type: "חוזה",
        payload: {
          contractId: contract._id,
          time: new Date().toISOString(),
          note: "החוזה פעיל וחתום על ידי שני הצדדים",
        },
        channel: "in-app",
      });
    }

    await repo.populateContractDoc(contract);
    return contract;
  } catch (error) {
    if (!committed) {
      try {
        await session.abortTransaction();
      } catch {
        // ignore
      }
    }
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function getContractsBySupplier(
  userId,
  { page = 1, limit = 4, status , searchTerm} = {}
) {
  const supplierId = await SupplierRepository.getSupplierIdByUserId(userId);
  if (!supplierId) {
    throw new AppError(404, "ספק לא נמצא");
  }
  return await repo.getContractsBySupplier(supplierId, {
    page,
    limit,
    status,
    searchTerm,
  });
}
export async function getContractsByClient(
  userId,
  { page = 1, limit = 4, status, eventId,searchTerm   } = {}
) {
  return await repo.getContractsByClient(userId, {
    page,
    limit,
    status,
    eventId,
    searchTerm
  });
}
export async function updateContractService(contractId, s3Key) {
  return await repo.updateContract(contractId, { s3Key });
}
export async function verifyContractSignatureService(contractId) {
  const contract = await repo.getContractById(contractId);
  if (!contract) throw new AppError(404, "Contract not found");

  const result = {
    contractId,
    supplierSignatureValid: false,
    clientSignaturesValid: [],
  };

  const contractData = {
    eventId: contract.eventId,
    supplierId: contract.supplierId,
    clientId: contract.clientId,
    s3Key: contract.s3Key,
    paymentPlan: contract.paymentPlan,
  };

  // אימות חתימת ספק
  if (contract.supplierSignature?.signatureMeta?.contractHash) {
    const isValid = verifyContractSignature(
      contractData,
      contract.supplierSignature.signatureMeta.contractHash
    );
    result.supplierSignatureValid = isValid;
  }

  // אימות חתימות לקוחות
  if (contract.clientSignatures && contract.clientSignatures.length > 0) {
    contract.clientSignatures.forEach((sig) => {
      const isValid = sig.signatureMeta?.contractHash
        ? verifyContractSignature(contractData, sig.signatureMeta.contractHash)
        : false;

      result.clientSignaturesValid.push({
        clientId: sig.clientId,
        clientName: sig.userName,
        valid: isValid,
        timestamp: sig.at,
      });
    });
  }

  return result;
}

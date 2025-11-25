import * as repo from "../repositories/contract.repository.js";
import Supplier from "../models/supplier.model.js";
import {
  createSignatureMetadata,
  verifyContractSignature,
} from "../utils/signature.utils.js";
import { uploadFileAwsService } from "./uploadFileAws.service.js";
import { SupplierRepository } from "../repositories/suppliers.repositry.js";
import {
  getContractById,
  updateContract,
} from "../repositories/contract.repository.js";
import { PaymentService } from "./payment.service.js";
import mongoose from "mongoose";

// 🔹 יצירת חוזה חדש
export async function createContract(data, userId) {
  // Get the supplier document for this user
  const supplier = await Supplier.findOne({ user: userId });
  if (!supplier) throw new Error("Supplier not found");

  const contractData = {
    ...data,
    supplierId: supplier._id,
  };
  return await repo.createContract(contractData);
}

export async function getContract(contractId) {
  const contract = await repo.getContractById(contractId);
  if (!contract) throw new Error("Contract not found");
  return contract;
}

export async function cancelContractService(contractId, userId, party) {
  const contract = await getContractById(contractId);
  if (!contract) throw new Error("Contract not found");

  // אסור לבטל חוזה שכבר פעיל
  if (contract.status === "פעיל")
    throw new Error("Cannot cancel an active contract");

  // בדיקות הרשאה לפי צד
  if (party === "supplier") {
    const supplier = await Supplier.findOne({ user: userId });
    if (!supplier) throw new Error("Supplier not found");
    if (!contract.supplierId.equals(supplier._id))
      throw new Error("Not authorized");
  } else if (party === "client") {
    if (!contract.clientId.equals(userId)) throw new Error("Not authorized");
  } else {
    throw new Error("Invalid party");
  }

  // עדכון הסטטוס למבוטל
  const updatedContract = await updateContract(contractId, { status: "מבוטל" });
  return updatedContract;
}

// export async function signContractService(contractId, user, party, signatureMeta = {}, req, signatureData = null) {
//   if (!['client', 'supplier'].includes(party)) throw new Error('Invalid party');

//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     // 1) שליפה
//     const contract = await repo.getContractById(contractId);
//     if (!contract) throw new Error('Contract not found');
//  // Extract client info from request
//   const ipAddress = req?.ip || req?.connection?.remoteAddress || 'unknown';
//   const userAgent = req?.headers?.['user-agent'] || 'unknown';

//   // יצירת חתימה דיגיטלית
//   const signatureMetadata = createSignatureMetadata(user._id, contractId, {
//     eventId: contract.eventId,
//     supplierId: contract.supplierId,
//     clientId: contract.clientId,
//     s3Key: contract.s3Key,
//     paymentPlan: contract.paymentPlan,
//   });

//   // שמירת תמונת החתימה ל-S3 דרך הקלינט (הקליינט יעלה דרך signed URL)
//   // ואנחנו רק נשמור את ה-S3 Key בדיבי
//   let signatureS3Key = null;
//   if (signatureData) {
//     // signatureData צפוי להיות S3 Key שהקלינט כבר העלה
//     signatureS3Key = signatureData;
//     console.log('🔐 Signature S3 Key being saved:', signatureS3Key);
//   }

//   if (party === 'supplier') {
//     if (contract.supplierSignature) throw new Error('Supplier has already signed');
//     const supplierId=await SupplierRepository.getSupplierIdByUserId(user._id);
//     contract.supplierSignature = {
//       supplierId: supplierId,
//       supplierName: user.name,
//       supplierEmail: user.email,
//       signatureMeta: signatureMetadata,
//       signatureS3Key: signatureS3Key,
//       ipAddress,
//       userAgent,
//       at: new Date()
//     };
//   }
//   if (party === 'client') {
//     if (contract.clientSignatures.some(sig => sig.clientId.equals(user._id))) {
//       throw new Error('Client has already signed');
//     }
//     contract.clientSignatures.push({
//       clientId: user._id,
//       userName: user.name,
//       userEmail: user.email,
//       signatureMeta: signatureMetadata,
//       signatureS3Key: signatureS3Key,
//       ipAddress,
//       userAgent,
//       at: new Date()
//     });
//   }

//     // await repo.updateContract(contractId, contract);//??
//     await contract.save({ session });

//     // 3) אם שתי הצדדים חתמו → ליצור תשלומים + התראות
//     const bothSigned =
//       contract.supplierSignature &&
//       contract.clientSignatures.length > 0;

//     if (bothSigned) {
//       for (const payment of contract.paymentPlan) {
//         await PaymentService.createPayment(
//           contractId,
//           {
//             dueDate: payment.dueDate,
//             amount: payment.amount,
//             notes: payment.notes,
//           },
//           session
//         );
//       }
//     }

//     await session.commitTransaction();
//     session.endSession();
//     await fullContractPopulate(contract);
//     return contract;

//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// }
export async function signContractService(
  contractId,
  user,
  party,
  signatureMeta = {},
  req,
  signatureData = null
) {
  if (!["client", "supplier"].includes(party)) throw new Error("Invalid party");

  const session = await mongoose.startSession();
  let committed = false;

  try {
    session.startTransaction();

    // 1) שליפה (עם populate מלא מה-repo)
    const contract = await repo.getContractById(contractId);
    if (!contract) throw new Error("Contract not found");

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
      console.log("🔐 Signature S3 Key being saved:", signatureS3Key);
    }

    if (party === "supplier") {
      if (contract.supplierSignature) {
        throw new Error("Supplier has already signed");
      }

      const supplierId = await SupplierRepository.getSupplierIdByUserId(
        user._id
      );

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
        throw new Error("Client has already signed");
      }

      contract.clientSignatures.push({
        clientId: user._id,
        signatureMeta: signatureMetadata,
        signatureS3Key,
        ipAddress,
        userAgent,
        at: new Date(),
      });
    }

    // שמירה בתוך הטרנזאקציה
    await contract.save({ session });

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

    // סוגרים את הטרנזאקציה
    await session.commitTransaction();
    committed = true;
    await repo.populateContractDoc(contract);
    // פה כבר מחוץ לטרנזאקציה, אפשר לעשות populate על אותו המסמך

    return contract;
  } catch (error) {
    // אם הטרנזאקציה עוד לא נסגרה – רק אז מנסים abort
    if (!committed) {
      try {
        await session.abortTransaction();
      } catch (e) {
        // מתעלמים משגיאה שנייה של abort
      }
    }
    throw error;
  } finally {
    // תמיד סוגרים session פעם אחת בלבד
    await session.endSession();
  }
}

export async function getContractsBySupplier(userId) {
  return await repo.getContractsBySupplier(userId);
}

export async function getContractsByClient(userId) {
  return await repo.getContractsByClient(userId);
}

export async function updateContractService(contractId, s3Key) {
  return await repo.updateContract(contractId, { s3Key });
}

/**
 * אימות חתימה של חוזה - בדוק שלא שינו את החוזה אחרי החתימה
 */
export async function verifyContractSignatureService(contractId) {
  const contract = await repo.getContractById(contractId);
  if (!contract) throw new Error("Contract not found");

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

  // אימות חתימות קליינטים
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

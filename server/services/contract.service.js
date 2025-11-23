import * as repo from '../repositories/contract.repository.js';
import Supplier from '../models/supplier.model.js';
import { createSignatureMetadata, verifyContractSignature } from '../utils/signature.utils.js';
import { uploadFileAwsService } from './uploadFileAws.service.js';
import { SupplierRepository } from "../repositories/suppliers.repositry.js";
import { getContractById, updateContract } from '../repositories/contract.repository.js';

// 🔹 יצירת חוזה חדש
export async function createContract(data, userId) {
    // Get the supplier document for this user
    const supplier = await Supplier.findOne({ user: userId });
    if (!supplier) throw new Error('Supplier not found');
    
    const contractData = { 
        ...data, 
        supplierId: supplier._id,
        // If clientId is not provided, don't set it (it should come from the request)
    };
    return await repo.createContract(contractData);
}

export async function getContract(contractId) {
    const contract = await repo.getContractById(contractId);
    if (!contract) throw new Error('Contract not found');
    return contract;
}

export async function cancelContractService(contractId, userId, party) {
    const contract = await getContractById(contractId);
    if (!contract) throw new Error('Contract not found');

    // אסור לבטל חוזה שכבר פעיל
    if (contract.status === 'פעיל') throw new Error('Cannot cancel an active contract');

    // בדיקות הרשאה לפי צד
    if (party === 'supplier') {
        const supplier = await Supplier.findOne({ user: userId });
        if (!supplier) throw new Error('Supplier not found');
        if (!contract.supplierId.equals(supplier._id)) throw new Error('Not authorized');
    } else if (party === 'client') {
        if (!contract.clientId.equals(userId)) throw new Error('Not authorized');
    } else {
        throw new Error('Invalid party');
    }

    // עדכון הסטטוס למבוטל
    const updatedContract = await updateContract(contractId, { status: 'מבוטל' });
    return updatedContract;
}


export async function signContractService(contractId, user, party, signatureMeta = {}, req, signatureData = null) {
  if (!['client', 'supplier'].includes(party)) throw new Error('Invalid party');
  const contract = await repo.getContractById(contractId);
  if (!contract) throw new Error('Contract not found');
  
  // Extract client info from request
  const ipAddress = req?.ip || req?.connection?.remoteAddress || 'unknown';
  const userAgent = req?.headers?.['user-agent'] || 'unknown';
  
  // יצירת חתימה דיגיטלית
  const signatureMetadata = createSignatureMetadata(user._id, contractId, {
    eventId: contract.eventId,
    supplierId: contract.supplierId,
    clientId: contract.clientId,
    s3Key: contract.s3Key,
    paymentPlan: contract.paymentPlan,
  });
  
  // שמירת תמונת החתימה ל-S3 דרך הקלינט (הקליינט יעלה דרך signed URL)
  // ואנחנו רק נשמור את ה-S3 Key בדיבי
  let signatureS3Key = null;
  if (signatureData) {
    // signatureData צפוי להיות S3 Key שהקלינט כבר העלה
    signatureS3Key = signatureData;
    console.log('🔐 Signature S3 Key being saved:', signatureS3Key);
  }
  
  if (party === 'supplier') {
    if (contract.supplierSignature) throw new Error('Supplier has already signed');
    const supplierId=await SupplierRepository.getSupplierIdByUserId(user._id);
    contract.supplierSignature = { 
      supplierId: supplierId,
      supplierName: user.name,
      supplierEmail: user.email,
      signatureMeta: signatureMetadata,
      signatureS3Key: signatureS3Key,
      ipAddress,
      userAgent,
      at: new Date() 
    };
  }
  if (party === 'client') {
    if (contract.clientSignatures.some(sig => sig.clientId.equals(user._id))) {
      throw new Error('Client has already signed');
    }
    contract.clientSignatures.push({ 
      clientId: user._id, 
      userName: user.name,
      userEmail: user.email,
      signatureMeta: signatureMetadata,
      signatureS3Key: signatureS3Key,
      ipAddress,
      userAgent,
      at: new Date() 
    });
  }

  return repo.updateContract(contractId, contract);
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
  if (!contract) throw new Error('Contract not found');

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
    const isValid = verifyContractSignature(contractData, contract.supplierSignature.signatureMeta.contractHash);
    result.supplierSignatureValid = isValid;
  }

  // אימות חתימות קליינטים
  if (contract.clientSignatures && contract.clientSignatures.length > 0) {
    contract.clientSignatures.forEach((sig) => {
      const isValid = sig.signatureMeta?.contractHash ? verifyContractSignature(contractData, sig.signatureMeta.contractHash) : false;
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
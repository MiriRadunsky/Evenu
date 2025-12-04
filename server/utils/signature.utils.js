import crypto from 'crypto';

/**
 * יצירת חתימה דיגיטלית של חוזה
 * @param {Object} contractData - נתוני החוזה
 * @returns {string} hash של החתימה
 */
export function generateContractSignature(contractData) {
  const dataToSign = JSON.stringify({
    eventId: contractData.eventId,
    supplierId: contractData.supplierId,
    clientId: contractData.clientId,
    s3Key: contractData.s3Key,
    paymentPlan: contractData.paymentPlan,
  });

  return crypto.createHash('sha256').update(dataToSign).digest('hex');
}

/**
 * אימות חתימה דיגיטלית
 * @param {Object} contractData - נתוני החוזה
 * @param {string} signature - החתימה לאימות
 * @returns {boolean} האם החתימה תקפה
 */
export function verifyContractSignature(contractData, signature) {
  const recalculatedSignature = generateContractSignature(contractData);
  return recalculatedSignature === signature;
}

/**
 * יצירת token ייחודי לחתימה
 * @param {string} userId - מזהה המשתמש
 * @param {string} contractId - מזהה החוזה
 * @param {string} timestamp - זמן החתימה
 * @returns {string} token חתימה
 */
export function generateSignatureToken(userId, contractId, timestamp) {
  const data = `${contractId}:${userId}:${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * יצירת signature metadata עם כל הפרטים
 * @param {string} userId - מזהה המשתמש
 * @param {string} contractId - מזהה החוזה
 * @param {Object} contractData - נתוני החוזה
 * @returns {Object} metadata של החתימה
 */
export function createSignatureMetadata(userId, contractId, contractData) {
  const timestamp = new Date().toISOString();
  const contractHash = generateContractSignature(contractData);
  const signatureToken = generateSignatureToken(userId, contractId, timestamp);

  return {
    timestamp,
    contractHash,
    signatureToken,
  };
}

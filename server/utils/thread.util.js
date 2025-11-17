// utils/thread.util.js
import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * יצירת ThreadID קבוע על בסיס event+supplier+client
 */
export function generateThreadId(eventId, supplierId, clientId) {
  const combined = `${eventId}_${supplierId}_${clientId}`;
  const hash = crypto.createHash('md5').update(combined).digest('hex');
  const objectIdHex = hash.substring(0, 24);
  return new mongoose.Types.ObjectId(objectIdHex);
}


// utils/thread.util.js
import mongoose from 'mongoose';
import crypto from 'crypto';
import { sendMessage } from '../services/message.service.js';

/**
 * יצירת ThreadID קבוע על בסיס event+supplier+client
 */
export function generateThreadId(eventId, supplierId, clientId) {
  const combined = `${eventId}_${supplierId}_${clientId}`;
  const hash = crypto.createHash('md5').update(combined).digest('hex');
  const objectIdHex = hash.substring(0, 24);
  return new mongoose.Types.ObjectId(objectIdHex);
}


export async function openChatThread (eventId, supplierId, clientId) {  
  try {
      const threadId =  generateThreadId(eventId, supplierId, clientId);

      await sendMessage({
        threadId,
        from: { id: clientId, type: 'user' },
        to: { id: supplierId, type: 'supplier' },
        body: 'שלום וברכה! ממתין לתגובתך לפנייתי' // "Request approved" (Hebrew)
      });
    } catch (err) {
      // don't block the approval on messaging failures; log or rethrow if desired
      console.error('Failed to create initial thread message:', err);
    }
    return threadId;
}


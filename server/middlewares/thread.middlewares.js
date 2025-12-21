// middlewares/thread.middleware.js
import mongoose from 'mongoose';
import { generateThreadId } from '../utils/thread.util.js';
import User from '../models/user.model.js';

/**
 * Middleware שמוודא threadId עבור הודעות
 * אם הלקוח שולח ThreadID – משתמשים בו
 * אחרת – מחשבים חדש
 */
export async function attachThreadId(req, res, next) {
    try {
        const { eventId, supplierId, clientId, threadId: clientThreadId } = req.body || req.params;

        if (!eventId || !supplierId || !clientId) {
            return res.status(400).json({ message: 'Missing eventId, supplierId, or clientId' });
        }

        // בדיקה שהמשתמשים קיימים במסד
        const clientExists = await User.exists({ _id: clientId });
        const supplierExists = await User.exists({ _id: supplierId, role: 'supplier' });

        if (!clientExists || !supplierExists) {
            return res.status(404).json({ message: 'קך' });
        }

        // אם הלקוח שלח ThreadID – השתמש בו
        // אחרת – צור Thread חדש
        req.threadId = clientThreadId || generateThreadId(eventId, supplierId, clientId);

        next();
    } catch (err) {
        next(err);
    }
}

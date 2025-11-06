import { Router } from 'express';
import { addPayment, updatePayment } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// הוספת תשלום חדש לחוזה
router.post('/contracts/:id/payments', authenticate, addPayment);

// עדכון סטטוס תשלום
router.patch('/payments/:id', authenticate, updatePayment);

export default router;

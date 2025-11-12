import { Router } from 'express';
import { addPayment, updatePayment } from '../controllers/payment.controller';
import { authenticate, authGuard } from '../middlewares/auth.middleware';

const router = Router();

// הוספת תשלום חדש לחוזה
router.post('/contracts/:id/payments', authGuard, addPayment);

// עדכון סטטוס תשלום
router.patch('/payments/:id', authGuard, updatePayment);

export default router;

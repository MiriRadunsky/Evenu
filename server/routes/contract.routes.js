import { Router } from 'express';
import { createContract, getContract, signContract } from '../controllers/contract.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// 🔹 יצירת חוזה חדש
router.post('/contracts', authenticate, createContract);

// 🔹 שליפת חוזה קיים
router.get('/contracts/:id', authenticate, getContract);

// 🔹 חתימה על חוזה
router.post('/contracts/:id/sign', authenticate, signContract);

export default router;
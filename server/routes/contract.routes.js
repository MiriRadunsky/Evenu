import { Router } from 'express';
import * as cnt from '../controllers/contract.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { connect } from 'mongoose';

const router = Router();

// 🔹 יצירת חוזה חדש
router.post('/', authGuard, cnt.createContract);

// 🔹 שליפת חוזה קיים
router.get('/:id', authGuard, cnt.getContract);

// 🔹 חתימה על חוזה
router.post('/:id/sign', authGuard, cnt.signContract);

export default router;
import { Router } from 'express';
import { getSuppliers, getSupplierById } from '../controllers/supplier.controller';

const router = Router();

// 🔹 יצירת ספק חדש
router.post('/', createSupplier);

// 🔹 התחברות ספק – אימות סיסמה
router.post('/login', loginSupplier);

// 🔹 שליפת ספקים עם אפשרות סינון
router.get('/', getSuppliers);

// 🔹 שליפת ספק בודד לפי מזהה
router.get('/:id', getSupplierById);

// 🔹 עדכון פרופיל ספק
router.put('/:id', updateSupplier);
export default router;
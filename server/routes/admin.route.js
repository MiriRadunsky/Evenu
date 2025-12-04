// admin.route.js
import { Router } from 'express';
import * as controller from '../controllers/admin.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/role.middleware.js';

const router = Router();

// 🔹 כל ה-routes דורשים אימות + הרשאת מנהל
router.use(authGuard, isAdmin);

// 🔹 סטטיסטיקות
router.get('/stats', controller.getStats);

// 🔹 ספקים ממתינים
router.get('/suppliers/pending', controller.getPendingSuppliers);

// 🔹 ספקים פעילים
router.get('/suppliers/active', controller.getActiveSuppliers);

// 🔹 פרטי ספק בודד
router.get('/suppliers/:id', controller.getSupplierDetails);

// 🔹 אישור ספק
router.put('/suppliers/:id/approve', controller.approveSupplier);

// 🔹 דחיית ספק
router.put('/suppliers/:id/reject', controller.rejectSupplier);

// 🔹 חסימת ספק
router.put('/suppliers/:id/block', controller.blockSupplier);

// 🔹 ביטול חסימה של ספק
router.put('/suppliers/:id/unblock', controller.unblockSupplier);

// 🔹 קבלת כל המשתמשים
router.get('/users', controller.getAllUsers);

export default router;

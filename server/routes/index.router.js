import { Router } from 'express';

import authRouter from './auth.route.js';
import supplierRouter from './supplier.route.js';
import userRouter from './user.route.js'; // ⬅️ הוסף את זה!
// import eventRouter from './event.routes.js';
// import requestRouter from './request.routes.js';
import contractRouter from './contract.routes.js';
// import notificationRouter from './notification.routes.js';

const router = Router();

// 🔹 ראשי / home route
router.get('/', (req, res) => res.send('🏠 This is the Home Page'));

// 🔹 נתיבי משנה
router.use('/auth', authRouter);
router.use('/suppliers', supplierRouter);
router.use('/users', userRouter); // ⬅️ שנה את זה!
// router.use('/events', eventRouter);
// router.use('/requests', requestRouter);
router.use('/contracts', contractRouter);
// router.use('/notifications', notificationRouter);

// 🔹 Health check
router.get('/health', (req, res) => res.json({ up: true }));

// ✅ ES Modules export
export default router;

import { Router } from 'express';

import authRouter from './auth.route.js';
import supplierRouter from './supplier.route.js';
// import eventRouter from './event.routes.js';
// import requestRouter from './request.routes.js';
import contractRouter from './contract.routes.js';
// import notificationRouter from './notification.routes.js';

import userRouter from './user.route.js'; 
import eventRoutes from './event.route.js';
import requestsRouter from './request.route.js';
import notificationRoutes from './notification.routes.js';
const router = Router();

router.get('/', (req, res) => res.send('🏠 This is the Home Page'));

router.use('/auth', authRouter);
router.use('/suppliers', supplierRouter);
router.use('/users', userRouter); // ⬅️ שנה את זה!
// router.use('/events', eventRouter);
// router.use('/requests', requestRouter);
router.use('/contracts', contractRouter);
// router.use('/notifications', notificationRouter);
router.use('/users', userRouter);
router.use('/events', eventRoutes);
router.use('/requests', requestsRouter);
router.use('/notifications', notificationRoutes);


router.get('/health', (req, res) => res.json({ up: true }));

export default router;

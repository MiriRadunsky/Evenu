import { Router } from 'express';

import authRouter from './auth.route.js';
import supplierRouter from './supplier.route.js';
import contractRouter from './contract.routes.js';
import messageRouter from './message.route.js';
import categoriesRouter from './categories.route.js';
import userRouter from './user.route.js'; 
import eventRoutes from './event.route.js';
import requestsRouter from './request.route.js';
import notificationRoutes from './notification.routes.js';
import adminRouter from './admin.route.js';
import fileRouter from './file.route.js';
import threadRouter from './threads.route.js';
import dashboardRouter from './dashboard.routes.js';
import paymentRoutes from './payment.route.js';
import budgetRoutes from './budget.routes.js';
import citiesRouter from './cities.route.js';
import kashrutRouter from './kashrut.route.js';
import regionsRouter from './region.route.js';
const router = Router();

router.get('/', (req, res) => res.send('This is the Home Page'));

router.use('/auth', authRouter);
router.use('/suppliers', supplierRouter);
router.use('/users', userRouter); 
router.use('/contracts', contractRouter);
router.use('/messages', messageRouter);
router.use('/users', userRouter);
router.use('/events', eventRoutes);
router.use('/requests', requestsRouter);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRouter);
router.use('/file', fileRouter);
router.use('/threads', threadRouter);
router.use('/categories', categoriesRouter); 
router.use('/dashboard', dashboardRouter);  
router.use('/payments', paymentRoutes);
router.use('/budget', budgetRoutes);
router.use('/cities', citiesRouter);
router.use('/kashrut', kashrutRouter);
router.use("/regions", regionsRouter);


router.get('/health', (req, res) => res.json({ up: true }));

export default router;

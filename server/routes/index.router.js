import { Router } from 'express';

import authRouter from './auth.route.js';
import supplierRouter from './supplier.route.js';
import userRouter from './user.route.js'; // ⬅️ הוסף את זה!
import eventRoutes from './event.route.js';
import requestsRouter from './request.route.js';
const router = Router();

router.get('/', (req, res) => res.send('🏠 This is the Home Page'));

router.use('/auth', authRouter);
router.use('/suppliers', supplierRouter);
router.use('/users', userRouter);
router.use('/events', eventRoutes);
router.use('/requests', requestsRouter);


router.get('/health', (req, res) => res.json({ up: true }));

export default router;

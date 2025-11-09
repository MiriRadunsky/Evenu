import { Router } from 'express';
import { authGuard } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/user.controller.js';

const router = Router();

router.get('/me', authGuard, ctrl.getMe);
router.patch('/me', authGuard, ctrl.updateMe);

export default router;

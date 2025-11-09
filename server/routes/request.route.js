import { Router } from 'express';
import * as ctrl from '../controllers/request.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
const router = Router();


router.post('/:id/approve', authGuard, ctrl.approveRequest);
router.post('/:id/decline', authGuard, ctrl.declineRequest);

export default router;
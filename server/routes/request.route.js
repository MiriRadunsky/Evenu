import { Router } from 'express';
import { authGuard } from '../middlewares/auth.middleware.js';
import { RequestController } from '../controllers/request.controller.js';
const router = Router();

router.get('/supplier/requests', authGuard, RequestController.getSupplierRequests);
router.get('/', authGuard, RequestController.getAllRequestsByUserId);
router.post('/:id/approve', authGuard, RequestController.approveRequest);
router.post('/:id/decline', authGuard, RequestController.declineRequest);

export default router;
import { Router } from 'express';
import { authGuard } from '../middlewares/auth.middleware.js';
import { RequestController } from '../controllers/request.controller.js';
const router = Router();

router.use(authGuard);
router.get('/supplier', RequestController.getSupplierRequests);
router.get('/', RequestController.getAllRequestsByUserId);
router.post('/:id/approve', RequestController.approveRequest);
router.post('/:id/decline', RequestController.declineRequest);

export default router;


import { Router } from 'express';
import { createRequest, approveRequest, declineRequest } from '../controllers/request.controller';
import auth from '../middlewares/auth.middleware.js';
const router = Router();

router.post('/events/:eventId/requests',auth, createRequest);
router.post('/requests/:id/approve', auth, approveRequest);
router.post('/requests/:id/decline', auth, declineRequest);

export default router;
import { Router } from 'express';
import { createRequest, approveRequest, declineRequest } from '../controllers/request.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// 🔹 שליחת בקשה לספק עבור אירוע
router.post('/events/:eventId/requests', authenticate, createRequest);
// 🔹 אישור או סירוב בקשה
router.post('/requests/:id/approve', authenticate, approveRequest);
router.post('/requests/:id/decline', authenticate, declineRequest);

export default router;
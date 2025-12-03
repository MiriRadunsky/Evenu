import { Router } from 'express';
import * as ctrl from '../controllers/event.controller.js';
import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { roleGuard } from '../middlewares/role.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import validateObjectId from '../middlewares/validateObjectId.middleware.js';
import { createEventSchema, updateEventSchema } from '../validation/event.validation.js';
import { RequestController } from '../controllers/request.controller.js';

const router = Router();

// --- Public Routes ---
// סוגי אירועים - נגיש לכולם, אפילו ללא login
router.get('/types', ctrl.eventTypes);

// --- Authenticated Routes ---
// כל שאר הפעולות מחייבות authentication
router.use(authGuard);

// יצירת אירוע - רק למשתמשים שמחוברים (user בלבד)
router.post(
    '/',
    roleGuard(['user']),
    validateBody(createEventSchema),
    asyncHandler(ctrl.create)
);

// רשימת אירועים של המשתמש המחובר
router.get(
    '/',
    roleGuard(['user']),
    asyncHandler(ctrl.list)
);

// קבלת אירוע לפי ID - רק לבעל האירוע
router.get(
    '/:id',
    roleGuard(['user']),
    validateObjectId(),
    asyncHandler(ctrl.getById)
);

// עדכון אירוע - רק לבעל האירוע
router.patch(
    '/:id',
    roleGuard(['user']),
    validateObjectId(),
    validateBody(updateEventSchema),
    asyncHandler(ctrl.update)
);

// מחיקת אירוע - רק לבעל האירוע
router.delete(
    '/:id',
    roleGuard(['user']),
    validateObjectId(),
    asyncHandler(ctrl.remove)
);

// יצירת בקשה לאירוע - רק למשתמשים מחוברים
router.post(
    '/:eventId/requests',
    roleGuard(['user']),
    RequestController.createRequest
);

export default router;

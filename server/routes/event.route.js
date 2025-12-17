// routes/event.routes.js
import { Router } from 'express';
import { EventController } from '../controllers/event.controller.js';
import { RequestController } from '../controllers/request.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { roleGuard } from '../middlewares/role.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import validateObjectId from '../middlewares/validateObjectId.middleware.js';
import {
  createEventSchema,
  updateEventSchema,
} from '../validation/event.validation.js';
import { createRequestSchema } from '../validation/request.validation.js';

const router = Router();

// כל הראוטים כאן מוגנים ע"י auth + role
router.use(authGuard);
router.use(roleGuard(['user']));

// יצירת אירוע
router.post('/', validateBody(createEventSchema), EventController.create);

// כל האירועים (בלי פגינציה)
router.get('/', EventController.getAllEvents);

// סוגי אירועים
router.get('/types', EventController.eventTypes);

// אירועים רלוונטיים בלבד
router.get('/relevant', EventController.getRelevantEvents);

// גרסה עם פגינציה (אופציונלי)
router.get('/paged', EventController.getEventsPaged);

// אירוע בודד
router.get('/:id', validateObjectId(), EventController.getById);

// עדכון
router.patch(
  '/:id',
  validateObjectId(),
  validateBody(updateEventSchema),
  EventController.update
);

// מחיקה
router.delete('/:id', validateObjectId(), EventController.remove);

// יצירת בקשה לספק עבור אירוע
router.post(
  '/:eventId/requests',
  validateObjectId('eventId'),
  validateBody(createRequestSchema),
  RequestController.createRequest
);
router.put('/:id/budget', EventController.updateEventBudget);

// אירועים של המשתמש המחובר
router.get('/user-events', EventController.getUserEvents);

export default router;

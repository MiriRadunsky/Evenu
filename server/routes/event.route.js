import { Router } from 'express';
import * as ctrl from '../controllers/event.controller.js';
import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { roleGuard } from '../middlewares/role.middleware.js'; // ⬅️ הוספה
import { validateBody } from '../middlewares/validate.middleware.js';
import validateObjectId from '../middlewares/validateObjectId.middleware.js';
import { createEventSchema, updateEventSchema } from '../validation/event.validation.js';

const router = Router();

router.use(authGuard);
router.use(roleGuard(['user'])); 
router.post('/', validateBody(createEventSchema), asyncHandler(ctrl.create));
router.get('/', asyncHandler(ctrl.list));
router.get('/:id', validateObjectId(), asyncHandler(ctrl.getById));
router.patch('/:id', validateObjectId(), validateBody(updateEventSchema), asyncHandler(ctrl.update));
router.delete('/:id', validateObjectId(), asyncHandler(ctrl.remove));

export default router;
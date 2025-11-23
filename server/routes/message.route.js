import { Router } from 'express';
import * as cnt from '../controllers/message.controller.js';
import { attachThreadId } from '../middlewares/thread.middlewares.js';
const router = Router();

router.post('/', cnt.createMessage); 
// router.get('/:eventId/:supplierId/:clientId', attachThreadId, cnt.getMessages);
router.get('/:threadId', cnt.getMessages);


export default router;

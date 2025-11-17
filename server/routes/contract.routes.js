import { Router } from 'express';
import * as cnt from '../controllers/contract.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { connect } from 'mongoose';
import { uploadFileAwsController } from '../controllers/uploadFileAws.controller.js';
const router = Router();

// // 🔹 יצירת חוזה חדש
// router.post('/', authGuard, cnt.createContract);

// // 🔹 שליפת חוזה קיים
// router.get('/:id', authGuard, cnt.getContract);

// // 🔹 חתימה על חוזה
// router.post('/:id/sign', authGuard, cnt.signContract);


router.get('/upload-url', uploadFileAwsController.getUploadUrl);
router.get('/download-url', uploadFileAwsController.getDownloadUrl);

export default router;

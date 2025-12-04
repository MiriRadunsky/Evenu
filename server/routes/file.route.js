import { Router } from 'express';
import { authGuard } from '../middlewares/auth.middleware.js';
import { uploadFileAwsController } from '../controllers/uploadFileAws.controller.js';
const router = Router();



router.get('/upload-url', uploadFileAwsController.getUploadUrl);
router.get('/download-url', uploadFileAwsController.getDownloadUrl);

export default router;

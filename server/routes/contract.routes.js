// import { Router } from 'express';
// import * as cnt from '../controllers/contract.controller.js';
// import { authGuard } from '../middlewares/auth.middleware.js';
// import { connect } from 'mongoose';
// import { uploadFileAwsController } from '../controllers/uploadFileAws.controller.js';
// const router = Router();

// // // 🔹 יצירת חוזה חדש
// // router.post('/', authGuard, cnt.createContract);

// // // 🔹 שליפת חוזה קיים
// // router.get('/:id', authGuard, cnt.getContract);

// // // 🔹 חתימה על חוזה
// // router.post('/:id/sign', authGuard, cnt.signContract);


// router.get('/upload-url', uploadFileAwsController.getUploadUrl);
// router.get('/download-url', uploadFileAwsController.getDownloadUrl);

// export default router;

import { Router } from 'express';
import * as cnt from '../controllers/contract.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { connect } from 'mongoose';
import { uploadFileAwsController } from '../controllers/uploadFileAws.controller.js';
const router = Router();

// 🔹 יצירת חוזה חדש
router.post('/', authGuard, cnt.createContract);

// 🔹 לקוח - שליפת החוזים שלו (קליינט)
router.get('/', authGuard, cnt.getContractsByClient);

// 🔹 קבלת תמונת חתימה מ-S3 (צריך להיות לפני /:id)
router.get('/signature',authGuard, cnt.getSignatureImage);

// 🔹 ספק - שליפת החוזים שלו
router.get('/supplier', authGuard, cnt.getContractsBySupplier);

// 🔹 שליפת חוזה קיים
router.get('/:id', authGuard, cnt.getContract);

// 🔹 חתימה על חוזה
router.post('/:id/sign', authGuard, cnt.signContract);
router.post('/:id/cancel', authGuard, cnt.cancelContract);
// 🔹 אימות חתימה דיגיטלית
router.get('/:id/verify-signature', authGuard, cnt.verifyContractSignature);

router.get('/upload-url', authGuard, uploadFileAwsController.getUploadUrl);
router.get('/download-url', authGuard, uploadFileAwsController.getDownloadUrl);

// עדכון חוזה עם S3 Key
router.put('/:id', authGuard, cnt.updateContract);

export default router;
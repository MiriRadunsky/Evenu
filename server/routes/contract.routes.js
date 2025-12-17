import { Router } from 'express';
import * as cnt from '../controllers/contract.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { uploadFileAwsController } from '../controllers/uploadFileAws.controller.js';
const router = Router();

router.use(authGuard)
router.post('/', cnt.createContract);
router.get('/', cnt.getContractsByClient);
router.get('/signature', cnt.getSignatureImage);
router.get('/supplier', cnt.getContractsBySupplier);
router.get('/:id', cnt.getContract);
router.post('/:id/sign', cnt.signContract);
router.post('/:id/cancel', cnt.cancelContract);
router.get('/:id/verify-signature', cnt.verifyContractSignature);
router.get('/upload-url', uploadFileAwsController.getUploadUrl);
router.get('/download-url', uploadFileAwsController.getDownloadUrl);
router.put('/:id', cnt.updateContract);

export default router;


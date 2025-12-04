// import { Router } from 'express';
// import { PaymentController } from '../controllers/payment.controller.js';
// import { authGuard } from '../middlewares/auth.middleware.js';
// import { roleGuard } from '../middlewares/role.middleware.js';

// const router = Router();
// router.get(
//   '/client',
//   authGuard,
//   roleGuard('user'),
//   PaymentController.getClientPayments
// );

// // לספק
// router.get(
//   '/supplier',
//   authGuard,
//   roleGuard('supplier'),
//   PaymentController.getSupplierPayments
// );
// router.patch(`/:id/mark-paid`, authGuard,  roleGuard(['supplier','user']),PaymentController.markAsPaid);
// // הוספת תשלום חדש לחוזה
// // router.post('/contracts/:id/payments', authGuard, PaymentController.);//not used

// // עדכון סטטוס תשלום

// router.patch('/payments/:id', authGuard, PaymentController.update);
// export default router;

// routes/payment.routes.js
import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller.js";
import { authGuard } from "../middlewares/auth.middleware.js";
import { roleGuard } from "../middlewares/role.middleware.js";

const router = Router();

router.use(authGuard);

// תשלומים "שלי"
router.get(
  "/client",
  roleGuard(["user"]),
  PaymentController.getClientPayments
);
router.get(
  "/supplier",
  roleGuard(["supplier"]),
  PaymentController.getSupplierPayments
);

// CRUD בסיסי
router.post("/:contractId", roleGuard(["supplier"]), PaymentController.create);
router.get("/:paymentId", PaymentController.get);
router.put("/:paymentId", PaymentController.update);
router.delete("/:paymentId", PaymentController.delete);

// flow של תשלום
router.patch(
  "/:paymentId/report-paid",
  roleGuard(["user"]),
  PaymentController.reportPaid
);

router.patch(
  "/:paymentId/confirm-paid",
  roleGuard(["supplier"]),
  PaymentController.confirmPaid
);

router.patch(
  "/:paymentId/reject-paid",
  roleGuard(["supplier"]),
  PaymentController.rejectPaid
);

export default router;

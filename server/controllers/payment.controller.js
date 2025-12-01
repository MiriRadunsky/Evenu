// import asyncHandler from "../middlewares/asyncHandler.middleware.js";
// import { PaymentService } from "../services/payment.service.js";

// export const PaymentController = {

//   // POST /payments/:contractId
//   create: asyncHandler(async (req, res) => {
//     try {
//       const { contractId } = req.params;
//       const payment = await PaymentService.createPayment(contractId, req.body);
//       res.status(201).json(payment);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }),

//   // PUT /payments/:paymentId
//   update: asyncHandler(async (req, res) => {
//     try {
//       const { paymentId } = req.params;
//       const payment = await PaymentService.updatePayment(paymentId, req.body);
//       res.json(payment);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }),

//   // GET /payments/:paymentId
//   get: asyncHandler(async (req, res)=> {
//     try {
//       const { paymentId } = req.params;
//       const payment = await PaymentService.getPaymentById(paymentId);
//       res.json(payment);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }),

//   // GET /payments/contract/:contractId
//  getByContract: asyncHandler(async (req, res) =>{
//     try {
//       const { contractId } = req.params;
//       const payments = await PaymentService.getPaymentsByContract(contractId);
//       res.json(payments);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }),

// getClientPayments : asyncHandler(async (req, res) => {
//   const userId = req.user._id.toString();
//   const { payments, summary } = await PaymentService.getClientPayments(userId);
//   return res.status(200).json({
//     role: 'client',
//     payments,
//     summary,
//   });
// }),

// getSupplierPayments : asyncHandler(async (req, res) => {
//   const userId = req.user._id.toString();
//   const { payments, summary } = await PaymentService.getSupplierPayments(userId);
//   return res.status(200).json({
//     role: 'supplier',
//     payments,
//     summary,
//   })
//  }),
//   // controllers/payment.controller.js
// markAsPaid: asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { method, note, paidAt } = req.body;
//   const updated = await PaymentService.markPaymentAsPaid(id, {
//     method,
//     note,
//     paidAt,
//   });

//   return res.status(200).json(updated);
// }),

//   // DELETE /payments/:paymentId
//  delete: asyncHandler(async (req, res) => {
//     try {
//       const { paymentId } = req.params;
//       await PaymentService.createPayment(paymentId);
//       res.json({ success: true });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }),

// };

// controllers/payment.controller.js
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import { PaymentService } from "../services/payment.service.js";

export const PaymentController = {
  // POST /payments/:contractId
  create: asyncHandler(async (req, res) => {
    const { contractId } = req.params;
    const payment = await PaymentService.createPayment(
      contractId,
      req.body,
      null,
      req.user?._id
    );
    return res.status(201).json(payment);
  }),

  // PUT /payments/:paymentId
  update: asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    const payment = await PaymentService.updatePayment(paymentId, req.body);
    return res.json(payment);
  }),

  // GET /payments/:paymentId
  get: asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    const payment = await PaymentService.getPaymentById(paymentId);
    return res.json(payment);
  }),

  // GET /payments/contract/:contractId
  getByContract: asyncHandler(async (req, res) => {
    const { contractId } = req.params;
    const payments = await PaymentService.getPaymentsByContract(contractId);
    return res.json(payments);
  }),

  // GET /payments/client
  getClientPayments: asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    const { payments, summary } =
      await PaymentService.getClientPayments(userId);

    return res.status(200).json({
      role: "client",
      payments,
      summary,
    });
  }),

  // GET /payments/supplier
  getSupplierPayments: asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    const { payments, summary } =
      await PaymentService.getSupplierPayments(userId);

    return res.status(200).json({
      role: "supplier",
      payments,
      summary,
    });
  }),

  // PATCH /payments/:paymentId/report-paid   (לקוח מדווח ששילם)
  reportPaid: asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    const { method, note, documentKey } = req.body;

    const payment = await PaymentService.clientReportPaid({
      paymentId,
      user: req.user,
      method,
      note,
      documentKey,
    });

    return res.status(200).json(payment);
  }),

  // PATCH /payments/:paymentId/confirm-paid  (ספק מאשר ששולם)
  confirmPaid: asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    const { method, note, documentKey } = req.body;

    const payment = await PaymentService.supplierConfirmPaid({
      paymentId,
      user: req.user,
      method,
      note,
      documentKey,
    });

    return res.status(200).json(payment);
  }),

  // PATCH /payments/:paymentId/reject-paid   (ספק דוחה תשלום)
  rejectPaid: asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await PaymentService.supplierRejectPaid({
      paymentId,
      user: req.user,
      reason,
    });

    return res.status(200).json(payment);
  }),

  // DELETE /payments/:paymentId
  delete: asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    await PaymentService.deletePayment(paymentId);
    return res.json({ success: true });
  }),
};

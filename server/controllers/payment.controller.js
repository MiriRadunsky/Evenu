import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import { PaymentService } from "../services/payment.service.js";

export const PaymentController = {

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

  update: asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    const payment = await PaymentService.updatePayment(paymentId, req.body);
    return res.json(payment);
  }),

  get: asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    const payment = await PaymentService.getPaymentById(paymentId);
    return res.json(payment);
  }),

  getByContract: asyncHandler(async (req, res) => {
    const { contractId } = req.params;
    const payments = await PaymentService.getPaymentsByContract(contractId);
    return res.json(payments);
  }),

  getClientPayments: asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    const { page = 1, limit = 10, status, eventId, searchTerm } = req.query;

    const result = await PaymentService.getClientPayments(userId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      status: status || undefined,
      eventId: eventId || undefined,
      searchTerm,
    });

    return res.status(200).json({
      role: "user",
      ...result,
    });
  }),

  getSupplierPayments: asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    const { page = 1, limit = 10, status, eventId, searchTerm } = req.query;

    const result = await PaymentService.getSupplierPayments(userId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      status: status || undefined,
      eventId: eventId || undefined,
      searchTerm,
    });

    return res.status(200).json({
      role: "supplier",
      ...result,
    });
  }),

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
  delete: asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    await PaymentService.deletePayment(paymentId);
    return res.json({ success: true });
  }),
};

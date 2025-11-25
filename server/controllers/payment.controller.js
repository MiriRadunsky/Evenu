import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import { PaymentService } from "../services/payment.service.js";

export const PaymentController = {

  // POST /payments/:contractId
  create: asyncHandler(async (req, res) => {
    try {
      const { contractId } = req.params;
      const payment = await PaymentService.createPayment(contractId, req.body);
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),

  // PUT /payments/:paymentId
  update: asyncHandler(async (req, res) => {
    try {
      const { paymentId } = req.params;
      const payment = await PaymentService.updatePayment(paymentId, req.body);
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),

  // GET /payments/:paymentId
  get: asyncHandler(async (req, res)=> {
    try {
      const { paymentId } = req.params;
      const payment = await PaymentService.getPaymentById(paymentId);
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),

  // GET /payments/contract/:contractId
 getByContract: asyncHandler(async (req, res) =>{
    try {
      const { contractId } = req.params;
      const payments = await PaymentService.getPaymentsByContract(contractId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),

  // DELETE /payments/:paymentId
 delete: asyncHandler(async (req, res) => {
    try {
      const { paymentId } = req.params;
      await PaymentService.deletePayment(paymentId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }),

};

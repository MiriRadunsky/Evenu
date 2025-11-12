import srv from '../services/payment.service.js';
import asyncHandler from '../middlewares/asyncHandler.middleware.js';

export const addPayment = asyncHandler(async (req, res) => {
    const contractId = req.params.id;
    const paymentData = req.body;
    const payment = await srv.addPayment(contractId, paymentData);
    res.status(201).json({ message: 'Payment added', payment });
});
export const updatePayment = asyncHandler(async (req, res) => {
    const paymentId = req.params.id;
    const updateData = req.body;
    const updatedPayment = await srv.updatePayment(paymentId, updateData);
    res.json({ message: 'Payment updated', payment: updatedPayment });
});
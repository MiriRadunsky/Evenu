import Payment from "../models/payment.model.js";

export const PaymentRepository = {
  // יצירת תשלום חדש
  async create(contractId, data, session = null) {
  return Payment.create([{ contractId, ...data }], { session }).then(r => r[0]);
}
,

  // עדכון תשלום קיים
  async update(paymentId, data) {
    return Payment.findByIdAndUpdate(paymentId, data, { new: true });
  },

  // שליפת תשלום לפי מזהה
  async getById(paymentId) {
    return Payment.findById(paymentId);
  },

  // שליפת כל התשלומים לחוזה
  async getByContract(contractId) {
    return Payment.find({ contractId }).sort({ dueDate: 1 });
  },

  // מחיקת תשלום
  async delete(paymentId) {
    return Payment.findByIdAndDelete(paymentId);
  }
};

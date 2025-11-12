import Payment from "../models/payment.model";

// 🔹 הוספת תשלום חדש לחוזה
export async function addPayment(contractId, paymentData) {
    return Payment.create({
        contractId,
        ...paymentData
    });
}

// 🔹 עדכון סטטוס של תשלום קיים
export async function updatePayment(paymentId, updateData) {
    return Payment.findByIdAndUpdate(paymentId, updateData, { new: true });
}

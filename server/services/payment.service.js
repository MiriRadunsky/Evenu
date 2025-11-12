import repo from '../repositories/payment.repository.js';
export async function addPayment(contractId, paymentData) {
    return repo.addPayment(contractId, paymentData);
}

export async function updatePayment(paymentId, updateData) {
    return repo.updatePayment(paymentId, updateData); 
}
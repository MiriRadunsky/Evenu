import '../models/event.model.js'; // חובה לפני Contract
import '../models/user.model.js'; // חובה לפני Contract
import '../models/supplier.model.js'; // חובה לפני Contract
import Contract from '../models/contract.model.js';

// יצירת חוזה חדש
export async function createContract(contractData) {
    return await Contract.create(contractData);
}

// שליפת חוזה לפי מזהה
export async function getContractById(id) {
    const contract = await Contract.findById(id)
        .populate('eventId')
        .populate('supplierId')
        .populate('clientId');
    if (!contract) throw new Error('Contract not found');
    return contract;
}

// עדכון (למשל לצורך חתימה או שינוי סטטוס)
export async function updateContract(id, updateData) {
    return await Contract.findByIdAndUpdate(id, updateData, { new: true });
}

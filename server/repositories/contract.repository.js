import '../models/event.model.js'; 
import '../models/user.model.js';
import '../models/supplier.model.js'; 
import Contract from '../models/contract.model.js';
import Supplier from '../models/supplier.model.js';

// יצירת חוזה חדש
export async function createContract(contractData) {
    let contract = await Contract.create(contractData);
    return await fullContractPopulate(Contract.findById(contract._id));
}

function fullContractPopulate(query) {
    return query
        .populate('eventId', 'name date')
        .populate('clientId', 'name email')
        .populate({
            path: 'clientSignatures.clientId',
            select: 'name email'
        })
        .populate({
            path: 'supplierSignature.supplierId',
            select: 'name email user',
            populate: {
                path: 'user',
                select: 'name email'
            }
        })
        .populate({
            path: 'supplierId',
            populate: {
                path: 'user',
                select: 'name email'
            }
        });
}

// שליפת חוזה לפי מזהה
export async function getContractById(id) {
    const contract = await Contract.findById(id)
        .populate('eventId')
        .populate('supplierId')
        .populate('clientId');
    if (!contract) throw new Error('Contract not found');
    
    // וודא שכל החתימות מוחזרות עם signatureS3Key
    if (contract.supplierSignature) {
        console.log('📋 Supplier Signature S3Key:', contract.supplierSignature.signatureS3Key);
    }
    contract.clientSignatures?.forEach((sig, idx) => {
        console.log(`📋 Client Signature ${idx} S3Key:`, sig.signatureS3Key);
    });
    
    return contract;
}

// עדכון (למשל לצורך חתימה או שינוי סטטוס)
export async function updateContract(id, updateData) {
    let query = Contract.findByIdAndUpdate(id, updateData, { new: true });
    const updated = await fullContractPopulate(query);
    return updated;
}


// שליפת חוזים לפי ספק
export async function getContractsBySupplier(userId) {
    const supplier = await Supplier.findOne({ user: userId });
    if (!supplier) return [];

    let query = Contract.find({ supplierId: supplier._id }).sort({ createdAt: -1 });
    return await fullContractPopulate(query);
}

export async function getContractsByClient(userId) {
    let query = Contract.find({ clientId: userId }).sort({ createdAt: -1 });
    return await fullContractPopulate(query);
}

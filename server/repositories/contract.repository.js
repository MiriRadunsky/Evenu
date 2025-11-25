import '../models/event.model.js'; 
import '../models/user.model.js';
import '../models/supplier.model.js'; 
import Contract from '../models/contract.model.js';
import Supplier from '../models/supplier.model.js';


// משהו משותף לשני המצבים – רק תיאור מה לפופלייט
const CONTRACT_POPULATE_SPEC = [
  { path: 'eventId', select: 'name date' },
  { path: 'clientId', select: 'name email' },
  {
    path: 'clientSignatures.clientId',
    select: 'name email',
  },
  {
    path: 'supplierSignature.supplierId',
    select: 'name email user',
    populate: { path: 'user', select: 'name email' },
  },
  {
    path: 'supplierId',
    populate: { path: 'user', select: 'name email' },
  },
];

// יצירת חוזה חדש
export async function createContract(contractData) {
    let contract = await Contract.create(contractData);
    return await populateContractQuery(Contract.findById(contract._id));
}

// function populateContractQuery(query) {
//     return query
//         .populate('eventId', 'name date')
//         .populate('clientId', 'name email')
//         .populate({
//             path: 'clientSignatures.clientId',
//             model: 'User',
//             select: 'name email'
//         })
//         .populate({
//             path: 'supplierSignature.supplierId',
//             select: 'name email user',
//             populate: {
//                 path: 'user',
//                 select: 'name email'
//             }
//         })
//         .populate({
//             path: 'supplierId',
//             populate: {
//                 path: 'user',
//                 select: 'name email'
//             }
//         });
// }
export async function populateContractDoc(contract) {
  await contract.populate(CONTRACT_POPULATE_SPEC); 
  return contract;
}
function populateContractQuery(query) {
  return query.populate(CONTRACT_POPULATE_SPEC);
}

export async function getContractById(id) {
    const contract = await populateContractQuery(Contract.findById(id));
    return contract;
}

// עדכון (למשל לצורך חתימה או שינוי סטטוס)
export async function updateContract(id, updateData) {
    let query = Contract.findByIdAndUpdate(id, updateData, { new: true });
    const updated = await populateContractQuery(query);
    return updated;
}


// שליפת חוזים לפי ספק
export async function getContractsBySupplier(userId) {
    const supplier = await Supplier.findOne({ user: userId });
    if (!supplier) return [];

    let query = Contract.find({ supplierId: supplier._id }).sort({ createdAt: -1 });
    return await populateContractQuery(query);
}

export async function getContractsByClient(userId) {
    let query = Contract.find({ clientId: userId }).sort({ createdAt: -1 });
    return await populateContractQuery(query);
}

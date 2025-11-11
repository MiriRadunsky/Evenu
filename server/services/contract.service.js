import * as repo from '../repositories/contract.repository.js';

// 🔹 יצירת חוזה חדש
export async function createContract(data, userId) {
    const contractData = { ...data, clientId: userId };
    return await repo.createContract(contractData);
}

export async function getContract(contractId) {
    const contract = await repo.getContractById(contractId);
    if (!contract) throw new Error('Contract not found');
    return contract;
}


export async function signContractService(contractId, user, party,signatureMeta = {}) {
      if (!['client', 'supplier'].includes(party)) throw new Error('Invalid party');
    const contract = await repo.getContractById(contractId);
    if (!contract) throw new Error('Contract not found');
      if (party === 'supplier') {
    if (contract.supplierSignature) throw new Error('Supplier has already signed');
    contract.supplierSignature = { signatureMeta, at: new Date() };
  }
  if (party === 'client') {
    if (contract.clientSignatures.some(sig => sig.clientId.equals(user._id))) {
      throw new Error('Client has already signed');
    }
    contract.clientSignatures.push({ clientId: user._id, signatureMeta, at: new Date() });
  }

    return repo.updateContract(contractId, contract);
}

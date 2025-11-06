// contract.repository.js

// 🔹 יצירת חוזה חדש
async function createContract(contractData) {}

// 🔹 שליפת חוזה קיים לפי ID
async function getContract(contractId) {}

// 🔹 חתימה על חוזה
async function signContract(contractId, userId) {}

module.exports = {
    createContract,
    getContract,
    signContract
};

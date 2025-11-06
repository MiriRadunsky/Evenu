// supplier.repository.js

// 🔹 יצירת ספק חדש
async function createSupplier({ name, email, password, role }) {}

// 🔹 התחברות ספק – אימות סיסמה
async function loginSupplier({ email, password }) {}

// 🔹 שליפת ספק לפי ID
async function getSupplierById(id) {}

// 🔹 שליפת כל הספקים (עם סינון אופציונלי)
async function getSuppliers(filter = {}) {}

// 🔹 עדכון פרופיל ספק
async function updateSupplier(id, updateData) {}

// 🔹 יצירת JWT

module.exports = {
    createSupplier,
    loginSupplier,
    getSupplierById,
    getSuppliers,
    updateSupplier,
};

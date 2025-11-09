import userModel from '../models/user.model.js';

// 🔹 שליפת פרופיל משתמש לפי ID
export async function getUserById(id) {
    return await userModel.findById(id);
}

// 🔹 עדכון פרופיל משתמש
export async function updateUser(id, updateData) {
    return await userModel.findByIdAndUpdate(id, updateData, { new: true });
}

// 🔹 חיפוש משתמש לפי אימייל
export async function findByEmail(email) {
    return await userModel.findOne({ email });
}

// 🔹 יצירת משתמש חדש
export async function createUser(userData) {
    return await userModel.create(userData);
}
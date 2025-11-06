// auth.repository.js

// 🔹 יצירת משתמש חדש
async function createUser({ name, email, password, role }) {
    // TODO: לממש יצירת משתמש במסד הנתונים
}

// 🔹 התחברות – אימות סיסמה
async function loginUser({ email, password }) {
    // TODO: לממש התחברות ובדיקת סיסמה
}

// 🔹 שליפת פרופיל משתמש לפי ID
async function getUserById(id) {
    // TODO: לממש שליפת פרופיל משתמש
}

// 🔹 עדכון פרופיל משתמש
async function updateUser(id, updateData) {
    // TODO: לממש עדכון פרופיל משתמש
}

// 🔹 כניסה עם ספק חיצוני (Google)
async function loginOrCreateGoogleUser({ email, name }) {
    // TODO: לממש כניסה או יצירת משתמש דרך Google
}

// 🔹 יצירת JWT


module.exports = {
    createUser,
    loginUser,
    getUserById,
    updateUser,
    loginOrCreateGoogleUser,
};

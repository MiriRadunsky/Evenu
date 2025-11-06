// auth.repository.js
import User from '../models/user.model.js';utuu
// 🔹 יצירת משתמש חדש
async function createUser(userData) {
     const user = new User(userData);
  return await user.save();
    // TODO: לממש יצירת משתמש במסד הנתונים
}

// 🔹 התחברות – אימות סיסמה
async function loginUser(email) {
    // TODO: לממש התחברות ובדיקת סיסמה
  return await User.findOne({ email });
}


// 🔹 כניסה עם ספק חיצוני (Google)
async function loginOrCreateGoogleUser({ email, name }) {
    // TODO: לממש כניסה או יצירת משתמש דרך Google
}

// 🔹 יצירת JWT


module.exports = {
    createUser,
    loginUser,
    loginOrCreateGoogleUser,
};

// auth.repository.js
import User from '../models/user.model.js';
// 🔹 יצירת משתמש חדש
export async function createUser(userData) {
     const user = new User(userData);
  return await user.save();
    // TODO: לממש יצירת משתמש במסד הנתונים
}

// 🔹 התחברות – אימות סיסמה
export async function findUserByEmail(email) {
    // TODO: לממש התחברות ובדיקת סיסמה
  return await User.findOne({ email });
}

// 🔹 מציאת משתמש לפי Google ID
export async function findUserByGoogleId(googleId) {
    return await User.findOne({ 'social.googleId': googleId });
}

// 🔹 עדכון Google ID למשתמש קיים
export async function updateUserGoogleId(userId, googleId) {
    return await User.findByIdAndUpdate(
        userId,
        { 'social.googleId': googleId },
        { new: true }
    );
}



export const createUserWithGoogle = async (profile) => {
  const tempPassword = Math.random().toString(36).slice(-8);
  const hashed = await bcrypt.hash(tempPassword, 10);

  const user = await User.create({
    name: profile.displayName || '',
    email: profile.emails[0].value,
    password: hashed,
    role: 'user',
    social: { googleId: profile.id }
  });

  return user;
};

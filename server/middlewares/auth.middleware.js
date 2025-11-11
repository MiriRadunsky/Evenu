// src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';
export async function authGuard(req, res, next) {
  try {
    // 🔹 שליפת ה-Token מה-Headers
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid token' });
    }

    const token = authHeader.replace('Bearer ', '');

    // 🔹 אימות ה-Token בעזרת הסוד
    const decoded = jwt.verify(token, process.env.SECRET);

    // 🔹 חיפוש המשתמש במסד הנתונים לפי ה-ID שב-Token
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    // 🔹 שמירת פרטי המשתמש בבקשה להמשך הטיפול
    req.user = user;
    next();
  } catch (err) {
    console.error('AuthGuard error:', err);
    res.status(401).json({ message: 'Unauthorized' });
  }
}

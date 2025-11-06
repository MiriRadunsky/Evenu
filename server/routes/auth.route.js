import { Router } from 'express';
import { register, login, googleLogin, getProfile, updateProfile } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// 🔹 רישום משתמש חדש
router.post('/register', register);

// 🔹 התחברות רגילה
router.post('/login', login);

// 🔹 רישום משתמש חדש
router.post('/supplier/register', supplierRegister);

// 🔹 התחברות רגילה
router.post('/supplier/login', supplierLogin);

// 🔹 כניסה עם ספק חיצוני (Google)
router.post('/google', googleLogin);

// 🔹 שליפת פרופיל משתמש מחובר
router.get('/me', authenticate, getProfile);

// 🔹 עדכון פרופיל
router.patch('/me', authenticate, updateProfile);

export default router;

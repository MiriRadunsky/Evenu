import { Router } from 'express';
import { register, login, googleLogin, getProfile, updateProfile } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// 🔹 רישום משתמש חדש
router.post('/register', register);

// 🔹 התחברות רגילה
router.post('/login', login);


// 🔹 כניסה עם ספק חיצוני (Google)
router.post('/google', googleLogin);


export default router;

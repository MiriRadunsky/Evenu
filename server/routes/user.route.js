import { Router } from 'express';
import { authenticate, getProfile , authenticate , updateProfile } from '../controllers/user.controller';

const router = Router();

// 🔹 שליפת פרופיל משתמש מחובר
router.get('/me', authenticate, getProfile);

// 🔹 עדכון פרופיל
router.patch('/me', authenticate, updateProfile);

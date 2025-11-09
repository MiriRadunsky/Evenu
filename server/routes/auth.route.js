import { Router } from 'express';
// import { register, login, googleLogin, getProfile, updateProfile } from '../controllers/auth.controller';
import * as cont from '../controllers/auth.controller.js';
import { loginSchema, registerSchema } from '../validation/auth.validation.js';
import { validateBody } from '../middlewares/validate.middleware.js';

const router = Router();

// router.post('/register', validateBody(registerSchema), register);
// router.post('/login', validateBody(loginSchema), login);

router.post('/register', validateBody(registerSchema),cont.register);
router.post('/login',validateBody(loginSchema),cont.login);



// 🔹 כניסה עם ספק חיצוני (Google)
// router.post('/google', googleLogin);


export default router;
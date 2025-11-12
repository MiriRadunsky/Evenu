import { Router } from 'express';
// import { register, login, googleLogin, getProfile, updateProfile } from '../controllers/auth.controller';
import * as cont from '../controllers/auth.controller.js';
import { loginSchema, registerSchema } from '../validation/auth.validation.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import passport from '../config/passport.config.js';

const router = Router();

// router.post('/register', validateBody(registerSchema), register);
// router.post('/login', validateBody(loginSchema), login);

router.post('/register', validateBody(registerSchema), cont.register);
router.post('/login', validateBody(loginSchema), cont.login);



router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false }), cont.googleCallback);


export default router;
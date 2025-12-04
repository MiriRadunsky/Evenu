import { Router } from 'express';
import * as cont from '../controllers/auth.controller.js';
import { loginSchema, registerSchema } from '../validation/auth.validation.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import passport from '../config/passport.config.js';

const router = Router();

router.post('/register', validateBody(registerSchema), cont.register);
router.post('/login', validateBody(loginSchema), cont.login);

router.post('/google', cont.googleAuth);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), cont.googleCallback);


export default router;
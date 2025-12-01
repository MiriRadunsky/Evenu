import { Router } from 'express';
// import { register, login, googleLogin, getProfile, updateProfile } from '../cntrollers/auth.cntroller';
import * as cnt from '../controllers/auth.controller.js';
import { loginSchema, registerSchema, googleSchema } from '../validation/auth.validation.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import passport from '../config/passport.config.js';
import { authGuard } from '../middlewares/auth.middleware.js';

const router = Router();

router.post("/register", validateBody(registerSchema), cnt.register);router.post('/login', validateBody(loginSchema), cnt.login);

router.post('/google', validateBody(googleSchema), cnt.googleAuth);
router.post("/logout", authGuard, cnt.logout);

router.get("/role", authGuard, cnt.getRole);
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    res.json({
      success: true,
      user: req.user.user,
      token: req.user.token
    });
  }
);

export default router;
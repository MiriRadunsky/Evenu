const router = require('express').Router();
const { authGuard } = require('../middlewares/auth');
const ctrl = require('../controllers/user.controller');

router.get('/me', authGuard, ctrl.getMe);

router.patch('/me', authGuard, ctrl.updateMe);

module.exports = router;

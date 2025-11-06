const router = require('express').Router();
const { authGuard } = require('../middlewares/auth');
const { roleGuard } = require('../middlewares/role');
const validateObjectId = require('../middlewares/validateObjectId');
const ctrl = require('../controllers/supplier.controller');

const allowClientAdmin = [ 'user', 'admin' ];

// GET /api/suppliers?category=&region=&active=&q=&page=&limit=
router.get(
  '/',
  authGuard,
  roleGuard(allowClientAdmin),
  ctrl.getAll
);

// GET /api/suppliers/:id
router.get(
  '/:id',
  authGuard,
  roleGuard(allowClientAdmin),
  validateObjectId('id'),
  ctrl.getOne
);
// 🔹 רישום משתמש חדש
router.post('/supplier/register', supplierRegister);

module.exports = router;

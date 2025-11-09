
import validateObjectId from '../middlewares/validateObjectId.middleware.js';
import * as ctrl from '../controllers/supplier.controller.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { Router } from 'express';
import { roleGuard } from '../middlewares/role.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { supplierRegisterSchema } from '../validation/supplier.validation.js';

const router = Router();

const allowClientAdmin = [ 'user', 'admin' ];
const allowAll = [ 'user', 'admin', 'supplier' ];

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
// POST /api/supplier/register
router.post('/supplier/register', ctrl.supplierRegister);
// // POST /api/supplier/login
//PATCH /api/suppliers/:id
router.patch('/:id', ctrl.updateSupplierStatus);

export default router;
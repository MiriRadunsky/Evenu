
import validateObjectId from '../middlewares/validateObjectId.middleware.js';
import { authGuard } from '../middlewares/auth.middleware.js';
import { Router } from 'express';
import { roleGuard } from '../middlewares/role.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { supplierRegisterSchema } from '../validation/supplier.validation.js';
import { SupplierController } from '../controllers/supplier.controller.js';

const router = Router();

const allowClientAdmin = [ 'user', 'admin' ];
const allowAll = [ 'user', 'admin', 'supplier' ];

// GET /api/suppliers?category=&region=&active=&q=&page=&limit=
router.get(
  '/',
  authGuard,
  // roleGuard(allowClientAdmin),
  SupplierController.getAll
);

// GET /api/suppliers/:id
router.get(
  '/:id',
  authGuard,
  // roleGuard(allowClientAdmin),
  validateObjectId('id'),
  SupplierController.getOne
);
// POST /api/supplier/register
router.post('/register', validateBody(supplierRegisterSchema), SupplierController.supplierRegister);
// // POST /api/supplier/login
//PATCH /api/suppliers/:id
router.patch('/add-images', authGuard,SupplierController.updateMediaSupplier)
router.patch('/:id', SupplierController.updateSupplierStatus);
export default router;
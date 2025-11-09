import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import * as svc from '../services/supplier.service.js';
import * as serv from '../services/auth.service.js';

// query params: category, region, active, q, page, limit
export const getAll = asyncHandler(async (req, res) => {
  console.log("supplierController ", req.query);
  const data = await serv.listSuppliers(req.query);
  res.json(data);
});

export const getOne = asyncHandler(async (req, res) => {
  const data = await serv.getSupplier(req.params.id);
  res.json({ supplier: data });
});


//admin only
export const updateSupplierStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; 
  const updated = await serv.updateSupplierStatus(id, status);
  res.json({ message: 'Status updated', supplier: updated });
});


export const supplierRegister = asyncHandler(async (req, res) => {
  console.log("supplierController ");
  const { name, email, phone, password, category, regions, kashrut, portfolio, profileImage, description } = req.body;
  const { user, supplier } = await svc.registerSupplier({
    userData: { name, email, phone, password ,role: 'supplier' },
    supplierData: { category, regions, kashrut, portfolio, profileImage, description }
  });

  res.status(201).json({ message: 'Supplier created', user, supplier });
});

export const supplierLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { token } = await svc.supplierLogin(email, password);
  res.json({ token });
});

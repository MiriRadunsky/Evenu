import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import { SupplierService } from '../services/supplier.service.js';

export const SupplierController = {

  getAll : asyncHandler(async (req, res) => {
  const {_v, ...data} = await SupplierService.listSuppliers(req.query);
  res.status(200).json(data);
}),

  getOne : asyncHandler(async (req, res) => {
  const {_v, ...data} = await SupplierService.getSupplier(req.params.id);
  res.status(201).json({ supplier: data });
}),


  updateSupplierStatus : asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; 
  const {_v, ...updated} = await SupplierService.updateSupplierStatus(id, status);
  res.status(201).json({ supplier: updated });
}),


  supplierRegister : asyncHandler(async (req, res) => {
  const { name, email, phone, password, category, regions, kashrut, portfolio, profileImage, description } = req.body;
  const { user, supplier } = await SupplierService.registerSupplier({
    userData: { name, email, phone, password ,role: 'supplier' },
    supplierData: { category, regions, kashrut, portfolio, profileImage, description }
  });

  res.status(201).json({ message: 'Supplier created', user, supplier });
}),

  supplierLogin : asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { token } = await SupplierService.supplierLogin(email, password);
  res.status(201).json({ token });
})
};

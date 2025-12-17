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
  const {
    name,
    email,
    phone,
    password,
    role,
    category,
    regions,
    kashrut,
    description,
  } = req.body;

  console.log("🔵 הגיעה בקשת רישום ספק!");
  console.log("userData:", { name, email, phone, password: password ? "***" : "חסר", role });
  console.log("supplierData:", { category, regions: regions?.length || 0, kashrut, description });

  // קריאה לשירות הרישום
  const { user, supplier, token } = await SupplierService.registerSupplier({
    userData: { name, email, phone, password, role: role || "supplier" },
    supplierData: { category, regions, kashrut, description },
  });

  res.cookie('token', token, {
    httpOnly: true,        
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, 
  });
  return res.status(201).json({ success: true });
}),


 updateMediaSupplier:asyncHandler(async (req, res) => {
const id = req.user._id;
  const { profileImage,media } = req.body; 
  
  const {_v, ...updated} = await SupplierService.updateSupplierMedia(id,profileImage, media);
  res.status(201).json({ supplier: updated });
 }),

  supplierLogin : asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { token } = await SupplierService.supplierLogin(email, password);
  res.status(201).json({ token });
})
};

// admin.controller.js
import * as service from '../services/admin.service.js';
import asyncHandler from '../middlewares/asyncHandler.middleware.js';

// 🔹 קבלת סטטיסטיקות
export const getStats = asyncHandler(async (req, res) => {
  const stats = await service.getStats();
  
  res.json({
    success: true,
    data: stats
  });
});

// 🔹 קבלת ספקים ממתינים
export const getPendingSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await service.getPendingSuppliers();
  
  res.json({
    success: true,
    count: suppliers.length,
    data: suppliers
  });
});

// 🔹 קבלת ספקים פעילים
export const getActiveSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await service.getActiveSuppliers();
  
  res.json({
    success: true,
    count: suppliers.length,
    data: suppliers
  });
});

// 🔹 אישור ספק
export const approveSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await service.approveSupplier(id);
  
  res.json({
    success: true,
    message: result.message,
    data: result.supplier
  });
});

// 🔹 דחיית ספק
export const rejectSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await service.rejectSupplier(id);
  
  res.json({
    success: true,
    message: result.message,
    data: result.supplier
  });
});

// 🔹 חסימת ספק
export const blockSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await service.blockSupplier(id);
  
  res.json({
    success: true,
    message: result.message,
    data: result.supplier
  });
});

// 🔹 ביטול חסימה של ספק
export const unblockSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await service.unblockSupplier(id);
  
  res.json({
    success: true,
    message: result.message,
    data: result.supplier
  });
});

// 🔹 קבלת פרטי ספק
export const getSupplierDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const supplier = await service.getSupplierDetails(id);
  
  res.json({
    success: true,
    data: supplier
  });
});

// 🔹 קבלת כל המשתמשים
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await service.getAllUsers();
  
  res.json({
    success: true,
    count: users.length,
    data: users
  });
});

// 🔹 קבלת כל האירועים
export const getAllEvents = asyncHandler(async (req, res) => {
  const events = await service.getAllEvents();
  
  res.json({
    success: true,
    count: events.length,
    data: events
  });
});

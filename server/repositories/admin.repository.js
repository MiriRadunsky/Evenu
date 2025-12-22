// admin.repository.js
import Supplier from '../models/supplier.model.js';
import User from '../models/user.model.js';
import Event from '../models/event.model.js';

// 🔹 קבלת סטטיסטיקות כלליות
export async function getStats() {
  const [pendingSuppliers, activeSuppliers, totalUsers, activeEvents] = await Promise.all([
    Supplier.countDocuments({ status: 'ממתין' }),
    Supplier.countDocuments({ status: 'מאושר', isActive: true }),
    User.countDocuments(),
    Event.countDocuments({ status: 'active' })
  ]);

  return {
    pendingSuppliers,
    activeSuppliers,
    totalUsers,
    activeEvents
  };
}

// 🔹 קבלת ספקים ממתינים לאישור
export async function getPendingSuppliers() {
  return await Supplier.find({ status: 'ממתין' })
    .populate('user', 'name email phone')
    .populate('category', 'name')
    .sort({ createdAt: -1 });
}

// 🔹 קבלת ספקים פעילים
export async function getActiveSuppliers() {
  return await Supplier.find({ 
    status: { $in: ['מאושר', 'נחסם'] }
  })
    .populate('user', 'name email phone')
    .populate('category', 'name')
    .sort({ createdAt: -1 });
}

// 🔹 אישור ספק
export async function approveSupplier(supplierId) {
  return await Supplier.findByIdAndUpdate(
    supplierId,
    { status: 'מאושר', isActive: true },
    { new: true }
  ).populate('user', 'name email');
}

// 🔹 דחיית ספק
export async function rejectSupplier(supplierId) {
  return await Supplier.findByIdAndUpdate(
    supplierId,
    { status: 'נפסל', isActive: false },
    { new: true }
  ).populate('user', 'name email');
}

// 🔹 חסימת ספק
export async function blockSupplier(supplierId) {
  return await Supplier.findByIdAndUpdate(
    supplierId,
    { status: 'נחסם', isActive: false },
    { new: true }
  ).populate('user', 'name email');
}

// 🔹 ביטול חסימה של ספק
export async function unblockSupplier(supplierId) {
  return await Supplier.findByIdAndUpdate(
    supplierId,
    { status: 'מאושר', isActive: true },
    { new: true }
  ).populate('user', 'name email');
}

// 🔹 קבלת ספק לפי ID
export async function getSupplierById(supplierId) {
  return await Supplier.findById(supplierId)
    .populate('user', 'name email phone')
    .populate('category', 'name');
}

// 🔹 קבלת מספר אירועים של ספק
export async function getSupplierEventsCount(supplierId) {
  return await Event.countDocuments({ supplier: supplierId, status: 'active' });
}

// 🔹 קבלת כל המשתמשים
export async function getAllUsers() {
  return await User.find()
    .select('name email phone role createdAt')
    .sort({ createdAt: -1 });
}

// 🔹 קבלת כל האירועים
export async function getAllEvents() {
  return await Event.find()
    .populate('ownerId', 'name email')
    .sort({ createdAt: -1 });
}

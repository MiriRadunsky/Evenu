import { AppError } from '../middlewares/error.middleware.js';
import * as repo from '../repositories/suppliers.repositry.js';
import * as authServ from '../services/auth.service.js';
export async function listSuppliers(query) {
  const { items, total, page, limit } = await repo.findMany(query);
  return {
    suppliers: items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit || 1)
    }
  };
}

export async function getSupplier(id) {
  const supplier = await repo.findById(id);
  if (!supplier) throw new AppError(404, 'Supplier not found');
  return supplier;
}

export async function updateSupplierStatus(id, status) {
  const validStatuses = ['בהמתנה', 'מאושר', 'נפסל', 'נחסם'];
  if (!validStatuses.includes(status)) {
    throw new AppError(400, 'סטטוס לא תקין');
  }

  const supplier = await repo.updateStatus(id, status);
  if (!supplier) throw new AppError(404, 'ספק לא נמצא');

  return supplier;
}

export async function registerSupplier({ userData, supplierData }) {

  const {token,user} = await authServ.register({ ...userData});
  const supplier = await repo.createSupplier({
    user: user._id,
    ...supplierData
  });

  return { user, supplier };
}

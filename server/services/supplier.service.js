const { AppError } = require('../middlewares/error');
const repo = require('../repositories/supplier.repo');

async function listSuppliers(query) {
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

async function getSupplier(id) {
  const supplier = await repo.findById(id);
  if (!supplier) throw new AppError(404, 'Supplier not found');
  return supplier;
}
async function updateSupplierStatus(id, status) {
  const validStatuses = ['בהמתנה', 'מאושר', 'נפסל', 'נחסם'];
  if (!validStatuses.includes(status)) {
    throw new Error('סטטוס לא תקין');
  }

  const supplier = await supplierRepository.updateStatus(id, status);
  if (!supplier) throw new Error('ספק לא נמצא');

  return supplier;
}
module.exports = { listSuppliers, getSupplier, updateSupplierStatus };

import { AppError } from "../middlewares/error.middleware.js";
import * as authServ from "../services/auth.service.js";
import { SupplierRepository } from "../repositories/suppliers.repositry.js";

export const SupplierService = {
  async listSuppliers(query) {
    const { items, total, page, limit } = await SupplierRepository.findMany(
      query
    );
    return {
      suppliers: items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit || 1),
      },
    };
  },
  async getSupplier(id) {
    const supplier = await SupplierRepository.findById(id);
    if (!supplier) throw new AppError(404, "Supplier not found");
    return supplier;
  },
  async updateSupplierStatus(id, status) {
    const validStatuses = ["בהמתנה", "מאושר", "נפסל", "נחסם"];
    if (!validStatuses.includes(status)) {
      throw new AppError(400, "סטטוס לא תקין");
    }

    const supplier = await SupplierRepository.updateStatus(id, status);
    if (!supplier) throw new AppError(404, "ספק לא נמצא");

    return supplier;
  },

  async registerSupplier({ userData, supplierData }) {
    const { token, user } = await authServ.register({ ...userData });
    const supplier = await SupplierRepository.createSupplier({
      user: user._id,
      ...supplierData,
    });

    return { user, supplier, token };
  },
};

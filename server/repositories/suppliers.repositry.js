import models from "../models/index.model.js";

const Supplier = models.Supplier;

export const SupplierRepository = {
  async updateStatus(id, status) {
    const isActive = !(
      status === "נפסל" ||
      status === "נחסם" ||
      status === "בהמתנה"
    );

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      { status, isActive },
      { new: true }
    ).populate("category", "label");

    if (!updatedSupplier) {
      throw new Error("Supplier not found");
    }

    return updatedSupplier;
  },

  async findMany({ category, region, active, q, page = 1, limit = 20 }) {
    const filter = {};
    if (category) filter.category = category;
    if (region) filter.regions = region;
    if (active !== undefined)
      filter.isActive = active === "true" || active === true;

    if (q) filter.$text = { $search: q };

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Supplier.find(filter)
        .populate("category", "label")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Supplier.countDocuments(filter),
    ]);

    return { items, total, page: Number(page), limit: Number(limit) };
  },
  async findById(id) {
    return Supplier.findById(id).populate("category", "label").lean();
  },
  async createSupplier(data) {
    return Supplier.create(data);
  },
};

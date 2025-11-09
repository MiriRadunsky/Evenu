import Supplier from '../models/supplier.model.js';

export async function updateStatus(id, status) {
  return await Supplier.findByIdAndUpdate(id, { status }, { new: true });
}

export async function findMany({ category, region, active, q, page = 1, limit = 20 }) {
  const filter = {};
  if (category) filter.category = category;
  if (region)   filter.regions  = region;
  if (active !== undefined) filter.isActive = active === 'true' || active === true;

  if (q) filter.$text = { $search: q };

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Supplier.find(filter)
      .populate('category', 'label')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Supplier.countDocuments(filter)
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
}

export function findById(id) {
  return Supplier.findById(id).populate('category', 'label').lean();
}

export async function createSupplier(data) {
  return Supplier.create(data);
}
import models from "../models/index.model.js";
import Category from "../models/category.model.js";
import Supplier from "../models/supplier.model.js";
import User from "../models/user.model.js";


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
    return updatedSupplier;
  },

  async findMany({ category, region, active, q, page = 1, limit = 20 }) {
    const filter = {};

    if (region) {
      filter.regions = { $in: [region.trim()] };
    }

    filter.status = "מאושר";

    // if (q) filter.$text = { $search: q };
if (q && q.trim()) {
  const term = q.trim();

  const users = await User.find({
    name: { $regex: term, $options: "i" },
  })
    .select("_id")
    .lean();

  const userIds = users.map((u) => u._id);

  if (userIds.length === 0) {
    return {
      items: [],
      total: 0,
      page: Number(page),
      limit: Number(limit),
    };
  }

  filter.user = { $in: userIds };
}

    if (category) {
      const cat = await Category.findOne({ label: category }).lean();
      if (cat) {
        filter.category = cat._id;
      } else {
        return {
          items: [],
          total: 0,
          page: Number(page),
          limit: Number(limit),
        };
      }
    }

  const skip = (Number(page) - 1) * Number(limit);
  console.log('SupplierRepository.findMany filter:', filter, 'limit:', limit, 'page:', page);

    const [items, total] = await Promise.all([
      Supplier.find(filter)
        .select("name category regions status profileImage")
        .populate("user", "name email")
        .populate("category", "label")
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean(),
      Supplier.countDocuments(filter),
    ]);
    console.log("Suppliers found:", items);
    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  },

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

  async getSupplierIdByUserId(userId) {
    const supplier = await Supplier.findOne({ user: userId }).lean();
    return supplier?._id || null;
  },
  async getSupplierByUserId(userId) {
    const supplier = await Supplier.findOne({ user: userId }).lean();
    return supplier || null;
  },
  async getSupplierById(_id) {
    const supplier = await Supplier.findOne({ _id }).lean();
    return supplier || null;
  },
  async findById(id) {
    return Supplier.findById(id)
      .populate("category", "label")
      .populate("user", "name email")
      .lean();
  },
  async createSupplier(data) {
    return Supplier.create(data);
  },
  async updateSupplierMedia(id, profileImage, media) {
    return Supplier.findByIdAndUpdate(
      id,
      { profileImage, media },
      { new: true }
    );
  },
};

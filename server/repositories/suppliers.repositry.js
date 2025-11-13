import models from "../models/index.model.js";
import Category from "../models/category.model.js"; // נתיב בהתאם למיקום שלך

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

  // async findMany({ category, region, active, q, page = 1, limit = 20 }) {
  //   const filter = {};
  //   if (category) filter.category = category;
  //   if (region) filter.regions = region;
  //   if (active !== undefined)
  //     filter.isActive = active === "true" || active === true;

  //   if (q) filter.$text = { $search: q };

  //   const skip = (Number(page) - 1) * Number(limit);

  //   // const [items, total] = await Promise.all([
  //   //   Supplier.find(filter)
  //   //     .select("name category regions status profileImage")
  //   //     .populate("category", "label")
  //   //     .sort({ createdAt: -1 })
  //   //     .skip(skip)
  //   //     .limit(Number(limit))
  //   //     .lean(),
  //   //   Supplier.countDocuments(filter),
  //   // ]);

  //   // return { items, total, page: Number(page), limit: Number(limit) };
  //    const [items, total] = await Promise.all([
  //   Supplier.find(filter)
  //     .select("name category regions status profileImage")
  //     .sort({ createdAt: -1 })
  //     .skip(skip)
  //     .limit(Number(limit))
  //     .lean(),
  //   Supplier.countDocuments(filter),
  // ]);

  // // אם רוצים לסנן category לפי שם מחרוזת – עושים לאחר השליפה
  // const filteredItems = category
  //   ? items.filter(item => item.categoryLabel === category || item.category?.label === category)
  //   : items;

  // return {
  //   items: filteredItems,
  //   total: filteredItems.length,
  //   page: Number(page),
  //   limit: Number(limit),
  // };
  // },
 
 async findMany({ category, region, active, q, page = 1, limit = 20 }) {
  const filter = {};

  // סינון לפי region
  if (region) filter.regions = region;

  // סינון לפי active
  if (active !== undefined)
    filter.isActive = active === "true" || active === true;

  // חיפוש טקסטואלי
  if (q) filter.$text = { $search: q };

  // המרה של שם קטגוריה ל־ObjectId
  if (category) {
    const cat = await Category.findOne({ label: category }).lean();
    if (cat) {
      filter.category = cat._id;
    } else {
      return { items: [], total: 0, page: Number(page), limit: Number(limit) };
    }
  }

  const skip = (Number(page) - 1) * Number(limit);

  // שליפת הנתונים
  const [items, total] = await Promise.all([
    Supplier.find(filter)
      .select("name category regions status profileImage")
      .populate("user", "name email")
      .populate("category", "label") 
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Supplier.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: Number(page),
    limit: Number(limit),
  };
},

async listSuppliers(query) {
  const { items, total, page, limit } = await SupplierRepository.findMany(query);
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

 
  async findById(id) {
    return Supplier.findById(id).populate("category", "label").populate("user", "name email").lean();
  },
  async createSupplier(data) {
    return Supplier.create(data);
  },
};

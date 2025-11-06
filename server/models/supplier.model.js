const { Schema, model, Types } = require('mongoose');

const portfolioSub = new Schema(
  {
    url: { type: String, required: true, trim: true },
    title: { type: String, trim: true }
  },
  { _id: false }
);

const profileImageSub = new Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, trim: true }
  },
  { _id: false }
);

const supplierSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: Types.ObjectId, ref: 'Category', required: true, index: true },
    regions: { type: [String], default: [], index: true },
    kashrut: { type: String, trim: true },
    portfolio: { type: [portfolioSub], default: [] },
    profileImage: { type: profileImageSub, default: null },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

supplierSchema.index({ category: 1, regions: 1, isActive: 1 });

module.exports = model('Supplier', supplierSchema);

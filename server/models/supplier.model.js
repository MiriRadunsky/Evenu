const { Schema, model, Types } = require('mongoose');

const portfolioSub = new Schema(
  { url: { type: String, required: true }, title: String },
  { _id: false }
);

const profileImageSub = new Schema(
  { url: { type: String, required: true }, alt: String },
  { _id: false }
);

const supplierSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: 'text' },
    category: { type: Types.ObjectId, ref: 'Category', required: true, index: true },
    regions: { type: [String], default: [], index: true }, // ['ירושלים','מרכז']
    kashrut: { type: String },
    contact: {
      phone: { type: String, trim: true },
      email: { type: String, lowercase: true, trim: true }
    },
    portfolio: [portfolioSub],
    profileImage: profileImageSub,
    description: { type: String },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

supplierSchema.index({ category: 1, regions: 1, isActive: 1 });

module.exports = model('Supplier', supplierSchema);

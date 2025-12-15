
import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

// תת־סקימה של תמונה (לתיק עבודות/גלריה)
const imageSub = new Schema(
  {
    key: { type: String, required: true, trim: true },
    alt: { type: String, trim: true }
  },
  { _id: false }
);

// תמונת פרופיל
const profileImageSub = new Schema(
  {
    key: { type: String, required: true, trim: true },
    alt: { type: String, trim: true }
  },
  { _id: false }
);

// כל המדיה של הספק (גלריה)
const mediaSub = new Schema(
  {
    images: { type: [imageSub], default: [] },
    videos: { type: [String], default: [] } // לינקים לוידאו (יוטיוב/ווימאו וכו')
  },
  { _id: false }
);

const supplierSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true, index: true },

    category: { type: Types.ObjectId, ref: 'Category', required: true, index: true },

    regions: { type: String, default: "מרכז", index: true },

    kashrut: { type: String, trim: true },

    media: { type: mediaSub, default: {} },

    profileImage: { type: profileImageSub, default: null },

    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['בהמתנה', 'מאושר', 'נפסל', 'נחסם'],
      default: 'בהמתנה',
      index: true
    }
  },
  { timestamps: true }
);

supplierSchema.index({ category: 1, regions: 1, isActive: 1 });

export default model('Supplier', supplierSchema);

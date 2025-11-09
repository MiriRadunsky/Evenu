import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const categorySchema = new Schema(
  {
    label: {
      type: String,
      enum: ['צלם', 'להקה', 'אולם', 'קייטרינג', 'עיצוב', 'אחר'],
      required: true
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default model('Category', categorySchema);

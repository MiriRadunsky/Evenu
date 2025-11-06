const { Schema, model } = require('mongoose');

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

module.exports = model('Category', categorySchema);

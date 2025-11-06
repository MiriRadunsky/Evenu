const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name: { type: String, trim: true, default: '' },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: { type: String, trim: true, default: '' },
    role: {
      type: String,
      enum: ['admin', 'user', 'supplier'],
      required: true,
      index: true
    },
    social: {
      googleId: { type: String, index: true, sparse: true }
    }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

module.exports = model('User', userSchema);
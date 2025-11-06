const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    role: { type: String, enum: ['מנהל', 'לקוח', 'ספק'], required: true, index: true },
    social: {
      googleId: { type: String, index: true }
    }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

module.exports = model('User', userSchema);

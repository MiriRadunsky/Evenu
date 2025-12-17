// models/user.model.js
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

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
    password: { type: String, required: true },
    social: {
      googleId: { type: String, index: true, sparse: true }
    }
  },
  { timestamps: true }
);

export default model('User', userSchema);

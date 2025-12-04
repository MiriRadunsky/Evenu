import Joi from 'joi';
import { registerSchema as userSchema } from './auth.validation.js';

// סכמה לאובייקט Portfolio
const portfolioItem = Joi.object({
  url: Joi.string().uri().required(),
  title: Joi.string().max(100).allow('', null)
});

// סכמה לאובייקט ProfileImage
const profileImage = Joi.object({
  url: Joi.string().uri().required(),
  alt: Joi.string().max(100).allow('', null)
});

// סכמה כוללת למשתמש + ספק
export const supplierRegisterSchema = userSchema.keys({
  // --- Supplier fields ---
  category: Joi.string().required(), // ObjectId של קטגוריה
  regions: Joi.array().items(Joi.string()).min(1).required(),
  kashrut: Joi.string().max(50).allow('', null),
  portfolio: Joi.array().items(portfolioItem).default([]),
  profileImage: profileImage.allow(null),
  description: Joi.string().max(500).allow('', null)
});
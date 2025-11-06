import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
   // הסיסמה חייבת להיות לפחות 8 תווים, לכלול לפחות:
    // - אות קטנה (a-z)
    // - אות גדולה (A-Z)
    // - ספרה (0-9)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'))
    .required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
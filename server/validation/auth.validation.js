import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required()
    .messages({
      'string.empty': 'שם מלא הוא שדה חובה',
      'string.min': 'שם מלא חייב להכיל לפחות 3 תווים',
      'string.max': 'שם מלא לא יכול להכיל יותר מ-50 תווים',
      'any.required': 'שם מלא הוא שדה חובה'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.empty': 'אימייל הוא שדה חובה',
      'string.email': 'כתובת האימייל אינה תקינה',
      'any.required': 'אימייל הוא שדה חובה'
    }),
  phone: Joi.string()
    .pattern(/^05\d{8}$/)
    .required()
    .messages({
      'string.empty': 'מספר טלפון הוא שדה חובה',
      'string.pattern.base': 'מספר טלפון חייב להתחיל ב-05 ולהכיל 10 ספרות',
      'any.required': 'מספר טלפון הוא שדה חובה'
    }),
  password: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'))
    .required()
    .messages({
      'string.empty': 'סיסמה היא שדה חובה',
      'string.pattern.base': 'הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה ומספר',
      'any.required': 'סיסמה היא שדה חובה'
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.empty': 'אימייל הוא שדה חובה',
      'string.email': 'כתובת האימייל אינה תקינה',
      'any.required': 'אימייל הוא שדה חובה'
    }),
  password: Joi.string().required()
    .messages({
      'string.empty': 'סיסמה היא שדה חובה',
      'any.required': 'סיסמה היא שדה חובה'
    })
});
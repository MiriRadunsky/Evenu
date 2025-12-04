import Joi from 'joi';

// Hebrew messages used so `validateBody` can return a readable message in Hebrew
const nameMessages = {
  'string.base': 'השם חייב להיות טקסט',
  'string.empty': 'השם הינו שדה חובה',
  'string.min': 'השם חייב להכיל לפחות {#limit} תווים',
  'string.max': 'השם יכול להכיל עד {#limit} תווים',
  'any.required': 'השם הינו שדה חובה'
};

const emailMessages = {
  'string.base': 'האימייל חייב להיות טקסט',
  'string.empty': 'אימייל הינו שדה חובה',
  'string.email': 'אימייל לא תקין',
  'any.required': 'אימייל הינו שדה חובה'
};

const phoneMessages = {
  'string.base': 'הטלפון חייב להיות טקסט',
  'string.empty': 'טלפון הינו שדה חובה',
  'string.pattern.base': 'מספר טלפון לא תקין — צריך להתחיל ב-05 ולהכיל 10 ספרות',
  'any.required': 'טלפון הינו שדה חובה'
};

const passwordMessages = {
  'string.base': 'הסיסמה חייבת להיות טקסט',
  'string.empty': 'סיסמה הינה שדה חובה',
  'string.min': 'הסיסמה חייבת להכיל לפחות {#limit} תווים',
  'string.pattern.base': 'הסיסמה חייבת להיות לפחות 8 תווים ולכלול אות קטנה, אות גדולה וספרה',
  'any.required': 'סיסמה הינה שדה חובה'
};

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages(nameMessages),
  email: Joi.string().email().required().messages(emailMessages),
  phone: Joi.string()
    .pattern(/^05\d{8}$/) // חייב להתחיל ב 05 ואחריו 8 ספרות → סה"כ 10 ספרות
    .required()
    .messages(phoneMessages),
  password: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'))
    .required()
    .messages(passwordMessages),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages(emailMessages),
  password: Joi.string().required().messages({
    'string.empty': 'סיסמה הינה שדה חובה',
    'any.required': 'סיסמה הינה שדה חובה'
  })
});

// NOTE: If you later add endpoints like google-login or update-profile,
// add schemas here and include appropriate Hebrew messages.

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
    .pattern(/^(05\d{8}|0\d{1,2}\d{7})$/)
    .required()
    .messages({
      'string.empty': 'מספר טלפון הוא שדה חובה',
      'string.pattern.base':
        'מספר טלפון חייב להיות תקין (05XXXXXXXX או מספר נייח כגון 03XXXXXXX)',
      'any.required': 'מספר טלפון הוא שדה חובה'
    }),
  password: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'))
    .required()
    .messages(passwordMessages),
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

// Schema for client-side Google auth (POST /auth/google)
// expects at least: email, googleId. name and picture are optional but validated if present.
export const googleSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'אימייל הוא שדה חובה',
    'string.email': 'כתובת האימייל אינה תקינה',
    'any.required': 'אימייל הוא שדה חובה'
  }),
  name: Joi.string().min(1).max(100).messages({
    'string.base': 'השם חייב להיות טקסט',
    'string.empty': 'השם לא יכול להיות ריק',
    'string.min': 'השם חייב להכיל לפחות {#limit} תווים',
    'string.max': 'השם לא יכול להכיל יותר מ-{#limit} תווים'
  }),
  googleId: Joi.string().required().messages({
    'string.base': 'googleId חייב להיות טקסט',
    'string.empty': 'googleId הוא שדה חובה',
    'any.required': 'googleId הוא שדה חובה'
  }),
  picture: Joi.string().uri().messages({
    'string.base': 'picture חייב להיות טקסט (URL)',
    'string.uri': 'picture חייב להיות URL תקין'
  })
}).messages({
  'object.unknown': 'שדה לא מוכר נמצא בבקשה'
});

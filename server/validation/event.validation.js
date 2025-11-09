import Joi from 'joi';

export const createEventSchema = Joi.object({
  name: Joi.string().required().min(2).max(100).messages({
    'string.empty': 'שם האירוע הוא שדה חובה',
    'string.min': 'שם האירוע חייב להכיל לפחות 2 תווים',
    'string.max': 'שם האירוע לא יכול להכיל יותר מ-100 תווים',
    'any.required': 'שם האירוע הוא שדה חובה'
  }),
  
  type: Joi.string().required().valid('חתונה', 'ברית', 'בר מצווה', 'בת מצווה', 'שבע ברכות', 'אחר').messages({
    'any.required': 'סוג האירוע הוא שדה חובה',
    'any.only': 'סוג האירוע לא תקין. אפשרויות: חתונה, ברית, בר מצווה, בת מצווה, שבע ברכות, אחר'
  }),
  
  date: Joi.date().required().min('now').messages({
    'date.base': 'תאריך האירוע לא תקין',
    'date.min': 'תאריך האירוע חייב להיות בעתיד',
    'any.required': 'תאריך האירוע הוא שדה חובה'
  }),
  
  estimatedGuests: Joi.number().required().integer().min(1).max(10000).messages({
    'number.base': 'מספר האורחים חייב להיות מספר',
    'number.integer': 'מספר האורחים חייב להיות מספר שלם',
    'number.min': 'מספר האורחים חייב להיות לפחות 1',
    'number.max': 'מספר האורחים לא יכול לעבור 10,000',
    'any.required': 'מספר האורחים הוא שדה חובה'
  }),
  
  locationRegion: Joi.string().optional().trim().max(100).messages({
    'string.max': 'אזור המיקום לא יכול להכיל יותר מ-100 תווים'
  }),
  
  budget: Joi.number().optional().min(0).messages({
    'number.base': 'התקציב חייב להיות מספר',
    'number.min': 'התקציב לא יכול להיות שלילי'
  })
});

export const updateEventSchema = Joi.object({
  name: Joi.string().optional().min(2).max(100).messages({
    'string.min': 'שם האירוע חייב להכיל לפחות 2 תווים',
    'string.max': 'שם האירוע לא יכול להכיל יותר מ-100 תווים'
  }),
  
  type: Joi.string().optional().valid('חתונה', 'ברית', 'בר מצווה', 'בת מצווה', 'שבע ברכות', 'אחר').messages({
    'any.only': 'סוג האירוע לא תקין. אפשרויות: חתונה, ברית, בר מצווה, בת מצווה, שבע ברכות, אחר'
  }),
  
  date: Joi.date().optional().min('now').messages({
    'date.base': 'תאריך האירוע לא תקין',
    'date.min': 'תאריך האירוע חייב להיות בעתיד'
  }),
  
  estimatedGuests: Joi.number().optional().integer().min(1).max(10000).messages({
    'number.base': 'מספר האורחים חייב להיות מספר',
    'number.integer': 'מספר האורחים חייב להיות מספר שלם',
    'number.min': 'מספר האורחים חייב להיות לפחות 1',
    'number.max': 'מספר האורחים לא יכול לעבור 10,000'
  }),
  
  locationRegion: Joi.string().optional().trim().max(100).messages({
    'string.max': 'אזור המיקום לא יכול להכיל יותר מ-100 תווים'
  }),
  
  budget: Joi.number().optional().min(0).messages({
    'number.base': 'התקציב חייב להיות מספר',
    'number.min': 'התקציב לא יכול להיות שלילי'
  }),
  
  status: Joi.string().optional().valid('פעיל', 'הושלם', 'בוטל').messages({
    'any.only': 'סטטוס לא תקין. אפשרויות: פעיל, הושלם, בוטל'
  })
}).min(1).messages({
  'object.min': 'חייב לספק לפחות שדה אחד לעדכון'
});
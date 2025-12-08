import Joi from 'joi';

export const createRequestSchema = Joi.object({
  supplierId: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.empty': 'יש לבחור ספק',
      'string.pattern.base': 'מזהה ספק לא תקין',
      'any.required': 'יש לבחור ספק',
    }),
  notesFromClient: Joi.string()
    .required()
    .min(5)
    .max(1000)
    .messages({
      'string.empty': 'יש להזין הודעה לספק',
      'string.min': 'ההודעה חייבת להכיל לפחות 5 תווים',
      'string.max': 'ההודעה לא יכולה להכיל יותר מ-1000 תווים',
      'any.required': 'יש להזין הודעה לספק',
    }),
});

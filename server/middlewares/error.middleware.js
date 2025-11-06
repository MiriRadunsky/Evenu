// AppError - שגיאה עסקית מובנית; errorHandler - מטפל שגיאות גלובלי
class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode || 500;
    this.details = details;
  }
}

function errorHandler(err, req, res, _next) {
  console.error('❌ Error:', err);

  // אם זו שגיאה עסקית שלנו
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }

  // Duplicate key – Mongo
  if (err.code === 11000) {
    return res.status(400).json({ error: 'Duplicate key', fields: err.keyValue });
  }

  // Validation – Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation error', details: err.errors });
  }

  // ברירת מחדל
  const status = err.statusCode || 500;
  return res.status(status).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

module.exports = { AppError, errorHandler };

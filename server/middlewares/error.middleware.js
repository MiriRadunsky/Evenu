function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err);

  // שגיאה צפויה מהלקוח (כמו ולידציה)
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // בעיות אימות (JWT)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Mongo duplicate key
  if (err.code === 11000) {
    return res.status(400).json({ error: 'Duplicate key error', fields: err.keyValue });
  }

  // ברירת מחדל
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}

module.exports = { errorHandler };

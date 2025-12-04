// שגיאה לוגית / עסקית מותאמת
export class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode || 500;
    this.details = details;
  }
}

export function errorHandler(err, req, res, _next) {
  console.error("❌ שגיאה:", err);

  // שגיאה עסקית שלנו
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
  }

  // שגיאת Duplicate Key של MongoDB
  if (err.code === 11000) {
    return res.status(400).json({
      error: "ערך קיים כבר במערכת",
      fields: err.keyValue,
    });
  }

  // שגיאות ולידציה של Mongoose
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "שגיאת ולידציה",
      details: err.errors,
    });
  }

  // ברירת מחדל – שגיאה לא צפויה
  const status = err.statusCode || 500;
  return res.status(status).json({
    error: "שגיאה פנימית בשרת",
    // בסביבת פיתוח אפשר להחזיר פירוט, בייצור – לא
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}

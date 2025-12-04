export class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode || 500;
    this.details = details;
  }
}


export function errorHandler(err, req, res, _next) {
  console.error("❌ שגיאה:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      message: "ערך קיים כבר במערכת",
      fields: err.keyValue,
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "שגיאת ולידציה",
      details: err.errors,
    });
  }

  const status = err.statusCode || 500;
  return res.status(status).json({
    message: "שגיאה פנימית בשרת",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}

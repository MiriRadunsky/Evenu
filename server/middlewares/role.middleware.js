import { AppError } from "./error.middleware.js";

export function roleGuard(allowed = []) {
  return (req, _res, next) => {
    const role = req.user?.role;
    if (!role || !allowed.includes(role)) {
      throw new AppError(403, 'Forbidden: insufficient role');
    }
    next();
  };
}

export function isAdmin(req, _res, next) {
  const role = req.user?.role;
  if (role !== 'admin') {
    throw new AppError(403, 'Forbidden: Admin access only');
  }
  next();
}

export function isSupplier(req, _res, next) {
  const role = req.user?.role;
  if (role !== 'supplier') {
    throw new AppError(403, 'Forbidden: Supplier access only');
  }
  next();
}

export function isUser(req, _res, next) {
  const role = req.user?.role;
  if (role !== 'user') {
    throw new AppError(403, 'Forbidden: User access only');
  }
  next();
}


import { AppError } from "./error.middleware.js";

export function roleGuard(allowed = []) {
  return (req, _res, next) => {
    const role = req.user?.role;
    console.log("RoleGuard - User Role:", role);
    if (!role || !allowed.includes(role)) {
      throw new AppError(403, 'Forbidden: insufficient role');
    }
    next();
  };
}


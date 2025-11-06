const { AppError } = require('./error');

function roleGuard(allowed = []) {
  return (req, _res, next) => {
    const role = req.user?.role;
    if (!role || !allowed.includes(role)) {
      throw new AppError(403, 'Forbidden: insufficient role');
    }
    next();
  };
}

module.exports = { roleGuard };

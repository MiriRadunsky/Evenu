import jwt from 'jsonwebtoken';
import * as userRepo from '../repositories/user.repository.js';
export async function authGuard(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "לא מאומת" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userRepo.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "משתמש לא נמצא" });
    }
    req.user = user;
    next();

  } catch (err) {
    console.error("שגיאת אימות:", err);
    return res.status(401).json({ message: "גישה לא מורשית" });
  }
}

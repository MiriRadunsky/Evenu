import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';
export async function authGuard(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('AuthGuard error:', err);
    res.status(401).json({ message: 'Unauthorized' });
  }
}

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as repo from '../repositories/auth.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import { generateToken } from '../utils/token.js';

const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRETkey';


export async function register({ name, email, phone, password, role }) {
    const existingUser = await repo.findUserByEmail(email);
    console.log(existingUser);
    
    if (existingUser) throw new AppError(409, 'משתש כבר קיים');
    console.log("password ",password)
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { name, email, phone, password: hashedPassword, role };
    const user = await repo.createUser(userData);
    const token = generateToken(user);
    return {user, token };
}

export async function login(email, password) {
    const user = await repo.findUserByEmail(email);
    if (!user) throw new AppError(404, 'User not found');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(401, 'Invalid credentials');

    const token = generateToken(user);
    return { token };
}
export async function googleAuth({ email, name, googleId }) {
  let user =
    await repo.findUserByGoogleId(googleId) ||
    await repo.findUserByEmail(email);

  if (user && !user.social?.googleId) {
    user = await repo.updateUserGoogleId(user._id, googleId);
  }

  if (!user) {
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    user = await repo.createUser({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      social: { googleId }
    });
  }

  const token = generateToken(user);
  return { token };
}

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, loginUser } from '../repositories/auth.repository.js';

const SECRET = process.env.JWT_SECRET || 'secretkey';

export async function register({ name, email, password }) {
    const existingUser = await findUserByEmail(email);
    if (existingUser) throw new Error('User already exists');
    const hashedPassword = await bcrypt.hash(password, 10);
    userData = { name, email, password: hashedPassword, role: 'user' };
    const user = await createUser(userData);
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: '1d' });
    return token;
}

export async function login({ email, password }) {
    const user = await findUserByEmail(email);
    if (!user) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: '1d' });
    return { user, token };
}
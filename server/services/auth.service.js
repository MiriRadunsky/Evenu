import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import { createUser, loginUser } from '../repositories/auth.repository.js';
import * as repo from '../repositories/auth.repository.js';
import { AppError } from '../middlewares/error.middleware.js';

const SECRET = process.env.SECRET || 'secretkey';
console.log("Secret",SECRET);


export async function register({ name, email, phone, password ,role}) {
    const existingUser = await repo.findUserByEmail(email);
    if (existingUser) throw new AppError(409, 'User already exists');
    console.log('password:', password);
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { name, email, phone, password: hashedPassword, role };
    const user = await repo.createUser(userData);
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: '1d' });
    return {user, token};
}

export async function login(email, password) {
    console.log("credentials: ", email, password);
    const user = await repo.findUserByEmail(email);
    if (!user) throw new AppError(404, 'User not found');
    console.log("BCYRPT ", password, user.password);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(401, 'Invalid credentials');

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: '1d' });
    return { token };
}
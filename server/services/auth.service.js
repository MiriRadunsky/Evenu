import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import { createUser, loginUser } from '../repositories/auth.repository.js';
import * as repo from '../repositories/auth.repository.js';
import { AppError } from '../middlewares/error.middleware.js';

const SECRET = process.env.JWT_SECRET || 'secretkey';


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

// Google Auth - טיפול בהתחברות עם Google
export async function googleAuth({ email, name, googleId, picture }) {
    let user = await repo.findUserByGoogleId(googleId);
    
    if (!user) {
        // אם המשתמש לא קיים, בודקים אם האימייל קיים
        user = await repo.findUserByEmail(email);
        
        if (user) {
            // אם האימייל קיים, מעדכנים את ה-googleId
            user = await repo.updateUserGoogleId(user._id, googleId);
        } else {
            // יצירת משתמש חדש
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
    }
    
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: '1d' });
    return { user, token };
}
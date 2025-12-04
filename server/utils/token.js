// 🔹 יצירת JWT
import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return token;
}

// 🔹 אימות JWT
export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}

// 🔹 חידוש JWT
// function refreshToken(token) { }




// 🔹 יצירת JWT
import jwt from 'jsonwebtoken';
export const generateToken = (user) =>{

// 🔹 אימות JWT
function verifyToken(token) {}
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return token;
}

// // 🔹 אימות JWT
// function verifyToken(token) { }

// // 🔹 חידוש JWT
// function refreshToken(token) { }




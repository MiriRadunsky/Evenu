import * as serv from "../services/auth.service.js";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";

export const register = asyncHandler(async (req, res) => {
  req.body.role = 'user'; 
  const { token } = await serv.register(req.body);
  res.status(201).json({ 
    success: true,
    message: "User registered successfully", 
    token
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { token } = await serv.login(email, password);
  res.json({ 
    success: true,
    message: "Login successful",
    token
  });
});

export const googleCallback = asyncHandler(async(req, res) => {
    const profile = req.user; // Passport שם את הפרופיל
    const { user, token } = await serv.googleLogin(profile);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
 
});

// Google Auth - מקבל נתונים ישירות מהלקוח
export const googleAuth = asyncHandler(async (req, res) => {
  const { email, name, googleId, picture } = req.body;
  
  const { user, token } = await serv.googleAuth({ email, name, googleId, picture });
  
  res.json({
    success: true,
    message: "Google authentication successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

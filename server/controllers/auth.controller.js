import * as serv from "../services/auth.service.js";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";


export const register = asyncHandler(async (req, res) => {
  console.log("Register - Request Body:", req.body);
  req.body.role = 'user';
  const { user, token } = await serv.register(req.body);
  console.log("Register - Token:", token);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 1000 * 60 * 60 * 24,
  });

  return res.status(201).json({ success: true });
});


export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { token } = await serv.login(email, password);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 1000 * 60 * 60 * 24,
  });

  return res.status(200).json({ success: true });
});

// =======================
// Google Auth Callback
// =======================
// אופציונלי אם משתמשים ב-Passport
// export const googleCallback = asyncHandler(async(req, res) => {
//   const profile = req.user;
//   const { user, token } = await serv.googleLogin(profile);

//   res.cookie("token", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
//     maxAge: 1000 * 60 * 60 * 24,
//   });

//   return res.status(200).json({
//     token,
//     user: {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role
//     }
//   });
// });

// =======================
// Google Auth - מהלקוח
// =======================
export const googleAuth = asyncHandler(async (req, res) => {
  const { email, name, googleId, picture } = req.body;

  const { token } = await serv.googleAuth({ email, name, googleId, picture });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 1000 * 60 * 60 * 24,
  });

  return res.status(200).json({ success: true });
});

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true בפרודקשן
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });

  return res.status(200).json({ message: "Logged out successfully" });
};

export const getRole = (req, res) => {
  if (!req.user || !req.user.role) {
    return res.status(404).json({ message: "Role not found" });
  }

  return res.status(200).json({ role: req.user.role });
};

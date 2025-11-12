import * as serv from "../services/auth.service.js";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";

export const register = asyncHandler(async (req, res) => {
  console.log("userController ", req.body);
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
  console.log("credentials controller: ", email, password);
  const { token } = await serv.login(email, password);
  res.json({ 
    success: true,
    message: "Login successful",
    token
  });
});

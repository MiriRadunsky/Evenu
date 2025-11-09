// src/controllers/auth.controller.js
import * as serv from '../services/auth.service.js';
import asyncHandler from '../middlewares/asyncHandler.middleware.js';

export const register = asyncHandler(async (req, res) => {
  console.log("userController ", req.body);
  req.body.role = 'user'; // Ensure role is set to 'user' for regular registrations
  const token = await serv.register(req.body);
  res.status(201).json({ message: 'User registered', token });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
console.log("credentials controller: ", email, password);
  const { token ,user} = await serv.login(email, password);
  res.json( token );
});

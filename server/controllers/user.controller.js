import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import * as userService from '../services/user.service.js';

export const getMe = asyncHandler(async (req, res) => {
  const { password, __v, ...userWithoutPassword } = req.user.toObject();
  res.json(userWithoutPassword);
});

export const updateMe = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateUser(req.user._id, req.body);
  const { password, __v, ...userWithoutPassword } = updatedUser.toObject();
  res.json(userWithoutPassword);
});

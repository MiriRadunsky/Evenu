import userModel from '../models/user.model.js';
import * as userRepository from '../repositories/user.repository.js';

export async function updateUser(userId, data) {
  const user = await userModel.findByIdAndUpdate(userId, data, { new: true });
  return user;
}

export async function getUserProfile(userId) {
  const user = await userRepository.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  const { password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
}
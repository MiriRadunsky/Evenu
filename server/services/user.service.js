import userModel from '../models/user.model.js';
import * as userRepository from '../repositories/user.repository.js';

export async function updateUser(userId, data) {
  const user = await userModel.findByIdAndUpdate(userId, data, { new: true });
  return user;
}

export async function getUserProfile(userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new Error('משתמש לא נמצא');
  }

  const { password, _id, ...userWithoutIdAndPassword } = user.toObject();
  console.log('Fetched user profile for userId:', userWithoutIdAndPassword);
  return userWithoutIdAndPassword;

}
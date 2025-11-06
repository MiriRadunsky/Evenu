const asyncHandler = require('../middlewares/asyncHandler.middleware');
const userService = require('../services/user.service');

exports.getMe = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await userService.getUserProfile(userId);
  
  res.status(200).json({
    success: true,
    data: user
  });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const updateData = req.body;
  
  const updatedUser = await userService.updateUserProfile(userId, updateData);
  
  res.status(200).json({
    success: true,
    data: updatedUser,
    message: 'Profile updated successfully'
  });
});
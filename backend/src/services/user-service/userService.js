const User = require('../../models/user-model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateUserId } = require('../../utils/userUtils');

const registerUser = async (data) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new Error('Email already registered');

  const hashed = await bcrypt.hash(data.password, 10);
  const userId = generateUserId(data.role || 'camper');

  const user = new User({ ...data, password: hashed, userId });
  return await user.save();
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  if (!user.isActive) throw new Error('Account is deactivated');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  return { token, user };
};

const getUserById = async (id) => {
  return await User.findById(id).select('-password');
};

const updateUser = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true }).select('-password');
};


const toggleUserStatus = async (id, isActive) => {
  return await User.findByIdAndUpdate(
    id,
    { isActive: isActive },
    { new: true }
  );
};
const getAllUsers = async () => {
  return await User.find().select('-password');
};

const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new Error('User not found');
  return user;
};

module.exports = { registerUser, loginUser, getUserById, updateUser, toggleUserStatus, getAllUsers, deleteUser };
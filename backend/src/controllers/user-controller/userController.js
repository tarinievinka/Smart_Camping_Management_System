const userService = require('../../services/user-service/userService');

const register = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json({ message: 'User registered successfully', userId: user.userId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.loginUser(email, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await userService.updateUser(req.user.id, req.body);
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin only
const setUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const isActive = req.body.isActive === true || req.body.isActive === 'true'; // 👈 fix this line
    const user = await userService.toggleUserStatus(id, isActive);
    res.status(200).json({
      message: `User ${isActive ? 'activated' : 'deactivated'}`,
      user
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.deleteUser(id);
    res.status(200).json({
      message: `User deleted`,
      user
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, setUserStatus, deleteUser, getAllUsers };
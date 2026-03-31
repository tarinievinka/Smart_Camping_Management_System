const userService = require('../../services/user-service/userService');

const jwt = require('jsonwebtoken'); // Added for token generation on register

const register = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    
    // Generate token for auto-login
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      message: 'User registered successfully', 
      token, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userId: user.userId
      }
    });
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

const deleteMyProfile = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.user.id);
    res.status(200).json({
      message: `Profile deleted successfully`,
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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const resetToken = await userService.forgotPassword(email);
    
    // Return token in development mode for testing
    res.status(200).json({ 
      message: 'Password reset email sent successfully',
      resetToken: resetToken,
      note: 'Development mode: Token returned for testing'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    await userService.resetPassword(token, newPassword);
    res.status(200).json({ 
      message: 'Password reset successfully' 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, setUserStatus, deleteUser, deleteMyProfile, getAllUsers, forgotPassword, resetPassword };
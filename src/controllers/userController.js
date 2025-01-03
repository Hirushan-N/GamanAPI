const User = require('../models/User');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const logger = require('../utils/logger');

// Joi validation schemas
const userSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$'))
    .required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'operator', 'commuter').default('commuter'),
});

exports.registerUser = async (req, res) => {
  try {
    // Validate request body
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Validation failed', details: error.details.map((e) => e.message) });
    }

    const { username, password, role, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    const user = new User({ username, password: password, role, email });

    await user.save();
    logger.info(`User registered successfully: ${username}`);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`);
    res.status(500).json({ error: 'An error occurred during registration. Please try again.' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filter } = req.query;

    // Apply filters
    const query = {};
    if (filter.username) query.username = new RegExp(filter.username.trim(), 'i');
    if (filter.role) query.role = filter.role.trim();
    if (filter.email) query.email = filter.email.trim();

    // Paginate results
    const users = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalUsers = await User.countDocuments(query);

    res.status(200).json({ users, total: totalUsers, page: Number(page), limit: Number(limit) });
  } catch (error) {
    logger.error(`Error searching users: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while fetching users. Please try again.' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    logger.error(`Error fetching user by ID: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while fetching the user. Please try again.' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, ...updateData } = req.body;

    // Hash new password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`User updated successfully: ${id}`);
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while updating the user. Please try again.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`User deleted successfully: ${id}`);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while deleting the user. Please try again.' });
  }
};

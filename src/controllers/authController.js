const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger'); // Custom logger utility for tracking events

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      logger.warn(`Failed login attempt: Invalid username - ${username}`);
      return res.status(401).json({ error: 'Invalid credentials. Please check your username and password.' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Failed login attempt: Invalid password for username - ${username}`);
      return res.status(401).json({ error: 'Invalid credentials. Please check your username and password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Remove password before sending user data
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    // Log successful login
    logger.info(`User logged in successfully: ${username}`);

    // Respond with token and user details
    res.status(200).json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    logger.error(`Error during login process: ${error.message}`);
    res.status(500).json({ error: 'An error occurred during login. Please try again later.' });
  }
};

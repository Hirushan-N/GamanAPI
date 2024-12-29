const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');
const Joi = require('joi');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

// Validation schemas for user operations
const registerUserValidationSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$'))
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.',
    }),
  role: Joi.string().valid('admin', 'operator', 'commuter').default('commuter'),
  email: Joi.string().email().required(),
});

const updateUserValidationSchema = Joi.object({
  username: Joi.string().min(3).max(30).optional(),
  role: Joi.string().valid('admin', 'operator', 'commuter').optional(),
  email: Joi.string().email().optional(),
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post(
  '/',
  validateRequest(registerUserValidationSchema),
  (req, res, next) => {
    logger.info(`Registering new user: ${req.body.username}`);
    next();
  },
  userController.registerUser
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Search users or get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: The username to filter by
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: The role to filter by
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: The email to filter by
 *     responses:
 *       200:
 *         description: List of users matching the search criteria or all users if no criteria are provided
 *       500:
 *         description: Internal server error
 */
router.get(
  '/',
  authenticateToken,
  authorizeRoles(['admin']),
  (req, res, next) => {
    logger.info('Fetching users with filters:', req.query);
    next();
  },
  userController.searchUsers
);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:userId',
  authenticateToken,
  authorizeRoles(['admin']),
  (req, res, next) => {
    logger.info(`Fetching user with ID: ${req.params.userId}`);
    next();
  },
  userController.getUserById
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               role:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  validateRequest(updateUserValidationSchema),
  (req, res, next) => {
    logger.info(`Updating user with ID: ${req.params.id}`);
    next();
  },
  userController.updateUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  (req, res, next) => {
    logger.info(`Deleting user with ID: ${req.params.id}`);
    next();
  },
  userController.deleteUser
);

module.exports = router;

const express = require('express');
const authController = require('../controllers/authController');
const { loginRateLimiter } = require('../middleware/rateLimiter');
const validateRequest = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');
const Joi = require('joi');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication-related endpoints
 */

// Validation schema for login
const loginValidationSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: StrongPassword123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post(
  '/login',
  loginRateLimiter,
  validateRequest(loginValidationSchema), // Input validation
  (req, res, next) => {
    logger.info(`Login attempt for user: ${req.body.username}`);
    next();
  },
  authController.loginUser
);

module.exports = router;

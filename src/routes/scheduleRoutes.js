const express = require('express');
const scheduleController = require('../controllers/scheduleController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');
const Joi = require('joi');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: Schedule management endpoints
 */

// Validation schemas for schedules
const createScheduleValidationSchema = Joi.object({
  scheduleName: Joi.string().required().example('Kandy-Colombo Route'),
  routeId: Joi.string().required(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
});

const updateScheduleValidationSchema = Joi.object({
  scheduleName: Joi.string().optional(),
  routeId: Joi.string().optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
});

/**
 * @swagger
 * /schedules:
 *   get:
 *     summary: Get all schedules
 *     tags: [Schedules]
 *     responses:
 *       200:
 *         description: List of schedules
 *       500:
 *         description: Internal server error
 */
router.get(
  '/',
  authenticateToken,
  (req, res, next) => {
    logger.info('Fetching schedules with filters:', req.query);
    next();
  },
  scheduleController.getAllSchedules
);

/**
 * @swagger
 * /schedules/{id}:
 *   get:
 *     summary: Get a schedule by ID
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the schedule
 *     responses:
 *       200:
 *         description: Schedule details
 *       404:
 *         description: Schedule not found
 */
router.get('/:id', authenticateToken, scheduleController.getScheduleById);

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: Create a new schedule
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduleName:
 *                 type: string
 *               routeId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       201:
 *         description: Schedule created successfully
 *       400:
 *         description: Validation failed
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles(['admin']),
  validateRequest(createScheduleValidationSchema),
  scheduleController.createSchedule
);

/**
 * @swagger
 * /schedules/{id}:
 *   put:
 *     summary: Update a schedule
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the schedule
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 *       404:
 *         description: Schedule not found
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  validateRequest(updateScheduleValidationSchema),
  scheduleController.updateSchedule
);

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     summary: Delete a schedule
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the schedule
 *     responses:
 *       200:
 *         description: Schedule deleted successfully
 *       404:
 *         description: Schedule not found
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  scheduleController.deleteSchedule
);

module.exports = router;

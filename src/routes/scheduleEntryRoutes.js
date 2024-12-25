const express = require('express');
const scheduleEntryController = require('../controllers/scheduleEntryController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');
const Joi = require('joi');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Schedule Entries
 *   description: Schedule entry management endpoints
 */

// Validation schemas for schedule entries
const createScheduleEntryValidationSchema = Joi.object({
  scheduleId: Joi.string().required(),
  busId: Joi.string().required(),
  departureTerminal: Joi.string().required(),
  arrivalTerminal: Joi.string().required(),
  departureTime: Joi.string().isoDate().required(),
  arrivalTime: Joi.string().isoDate().required(),
  stopsSchedule: Joi.array()
    .items(
      Joi.object({
        stop: Joi.string().required(),
        time: Joi.string().isoDate().required(),
      })
    )
    .required(),
  activeDays: Joi.array()
    .items(Joi.string().valid('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'))
    .required(),
});

const updateScheduleEntryValidationSchema = Joi.object({
  scheduleId: Joi.string().optional(),
  busId: Joi.string().optional(),
  departureTerminal: Joi.string().optional(),
  arrivalTerminal: Joi.string().optional(),
  departureTime: Joi.string().isoDate().optional(),
  arrivalTime: Joi.string().isoDate().optional(),
  stopsSchedule: Joi.array()
    .items(
      Joi.object({
        stop: Joi.string().optional(),
        time: Joi.string().isoDate().optional(),
      })
    )
    .optional(),
  activeDays: Joi.array()
    .items(Joi.string().valid('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'))
    .optional(),
});

/**
 * @swagger
 * /schedule-entries:
 *   get:
 *     summary: Get all schedule entries
 *     tags: [Schedule Entries]
 *     responses:
 *       200:
 *         description: List of schedule entries
 */
router.get('/', authenticateToken, scheduleEntryController.getAllScheduleEntries);

/**
 * @swagger
 * /schedule-entries/{id}:
 *   get:
 *     summary: Get a schedule entry by ID
 *     tags: [Schedule Entries]
 *     responses:
 *       200:
 *         description: Schedule entry details
 *       404:
 *         description: Schedule entry not found
 */
router.get('/:id', authenticateToken, scheduleEntryController.getScheduleEntryById);

/**
 * @swagger
 * /schedule-entries:
 *   post:
 *     summary: Create a new schedule entry
 *     tags: [Schedule Entries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduleId:
 *                 type: string
 *               busId:
 *                 type: string
 *               departureTerminal:
 *                 type: string
 *               arrivalTerminal:
 *                 type: string
 *               departureTime:
 *                 type: string
 *               arrivalTime:
 *                 type: string
 *               stopsSchedule:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     stop:
 *                       type: string
 *                     time:
 *                       type: string
 *               activeDays:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Schedule entry created successfully
 *       400:
 *         description: Validation failed
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles(['admin']),
  validateRequest(createScheduleEntryValidationSchema),
  scheduleEntryController.createScheduleEntry
);

/**
 * @swagger
 * /schedule-entries/{id}:
 *   put:
 *     summary: Update a schedule entry
 *     tags: [Schedule Entries]
 *     responses:
 *       200:
 *         description: Schedule entry updated successfully
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  validateRequest(updateScheduleEntryValidationSchema),
  scheduleEntryController.updateScheduleEntry
);

/**
 * @swagger
 * /schedule-entries/{id}:
 *   delete:
 *     summary: Delete a schedule entry
 *     tags: [Schedule Entries]
 *     responses:
 *       200:
 *         description: Schedule entry deleted successfully
 */
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), scheduleEntryController.deleteScheduleEntry);

module.exports = router;

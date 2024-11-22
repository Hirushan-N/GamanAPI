const express = require('express');
const tripScheduleController = require('../controllers/tripScheduleController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');
const Joi = require('joi');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Trip Schedules
 *   description: Trip schedule management endpoints
 */

// Validation schemas for trip schedules
const createTripScheduleValidationSchema = Joi.object({
  tripName: Joi.string().required().example('Morning Express'),
  busId: Joi.string().required(),
  routeId: Joi.string().required(),
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
  totalBookings: Joi.number().integer().min(0).default(0),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
});

const updateTripScheduleValidationSchema = Joi.object({
  tripName: Joi.string().optional(),
  busId: Joi.string().optional(),
  routeId: Joi.string().optional(),
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
  totalBookings: Joi.number().integer().min(0).optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
});

/**
 * @swagger
 * /trip-schedules:
 *   get:
 *     summary: Get all trip schedules or search by query parameters
 *     tags: [Trip Schedules]
 *     parameters:
 *       - in: query
 *         name: busId
 *         schema:
 *           type: string
 *         description: The ID of the bus to filter by
 *       - in: query
 *         name: routeId
 *         schema:
 *           type: string
 *         description: The ID of the route to filter by
 *       - in: query
 *         name: tripName
 *         schema:
 *           type: string
 *         description: The name of the trip to filter by
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         description: The status of the trip schedules to filter by
 *     responses:
 *       200:
 *         description: List of trip schedules
 *       500:
 *         description: Internal server error
 */
router.get(
  '/',
  authenticateToken,
  (req, res, next) => {
    logger.info('Fetching trip schedules with filters:', req.query);
    next();
  },
  tripScheduleController.getAllTripSchedules
);

/**
 * @swagger
 * /trip-schedules:
 *   post:
 *     summary: Create a new trip schedule
 *     tags: [Trip Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tripName:
 *                 type: string
 *                 description: Name of the trip
 *               busId:
 *                 type: string
 *                 description: ID of the bus
 *               routeId:
 *                 type: string
 *                 description: ID of the route
 *               departureTime:
 *                 type: string
 *                 description: ISO 8601 date-time for departure
 *               arrivalTime:
 *                 type: string
 *                 description: ISO 8601 date-time for arrival
 *               stopsSchedule:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     stop:
 *                       type: string
 *                       description: Stop name
 *                     time:
 *                       type: string
 *                       description: ISO 8601 date-time for the stop
 *               activeDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [MON, TUE, WED, THU, FRI, SAT, SUN]
 *                 description: Active days for the trip schedule
 *               totalBookings:
 *                 type: number
 *                 description: The total number of bookings for the trip (default is 0)
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 description: Status of the trip schedule
 *     responses:
 *       201:
 *         description: Trip schedule created successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized access
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles(['admin']),
  validateRequest(createTripScheduleValidationSchema),
  (req, res, next) => {
    logger.info(`Creating a new trip schedule: ${JSON.stringify(req.body)}`);
    next();
  },
  tripScheduleController.createTripSchedule
);

/**
 * @swagger
 * /trip-schedules/{id}:
 *   put:
 *     summary: Update a trip schedule by ID
 *     tags: [Trip Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the trip schedule to update
 *     responses:
 *       200:
 *         description: Trip schedule updated successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized access
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  validateRequest(updateTripScheduleValidationSchema),
  (req, res, next) => {
    logger.info(`Updating trip schedule with ID: ${req.params.id}`);
    next();
  },
  tripScheduleController.updateTripSchedule
);

/**
 * @swagger
 * /trip-schedules/{id}:
 *   delete:
 *     summary: Delete a trip schedule by ID
 *     tags: [Trip Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the trip schedule to delete
 *     responses:
 *       200:
 *         description: Trip schedule deleted successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized access
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  (req, res, next) => {
    logger.info(`Deleting trip schedule with ID: ${req.params.id}`);
    next();
  },
  tripScheduleController.deleteTripSchedule
);

module.exports = router;

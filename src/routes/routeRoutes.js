const express = require('express');
const routeController = require('../controllers/routeController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');
const Joi = require('joi');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Routes
 *   description: Route management endpoints
 */

// Validation schemas for routes
const createRouteValidationSchema = Joi.object({
  routeNumber: Joi.string().required().example('101'),
  startLocation: Joi.string().required().example('Colombo'),
  endLocation: Joi.string().required().example('Galle'),
  stops: Joi.array()
    .items(
      Joi.object({
        stopName: Joi.string().required(),
        stopType: Joi.string().valid('REGULAR', 'MAJOR').required(),
        gpsCoordinates: Joi.object({
          latitude: Joi.number().min(-90).max(90).required(),
          longitude: Joi.number().min(-180).max(180).required(),
        }).required(),
      })
    )
    .required(),
  variant: Joi.string().valid('EXPRESS', 'REGULAR').required(),
  duration: Joi.number().min(1).required().example(180), // Duration in minutes
  distance: Joi.number().min(1).required().example(120), // Distance in kilometers
  averageSpeed: Joi.number().min(1).required().example(60), // Speed in km/h
});

const updateRouteValidationSchema = Joi.object({
  routeNumber: Joi.string().optional(),
  startLocation: Joi.string().optional(),
  endLocation: Joi.string().optional(),
  stops: Joi.array()
    .items(
      Joi.object({
        stopName: Joi.string().required(),
        stopType: Joi.string().valid('REGULAR', 'MAJOR').required(),
        gpsCoordinates: Joi.object({
          latitude: Joi.number().min(-90).max(90).required(),
          longitude: Joi.number().min(-180).max(180).required(),
        }).required(),
      })
    )
    .optional(),
  variant: Joi.string().valid('EXPRESS', 'REGULAR').optional(),
  duration: Joi.number().min(1).optional(),
  distance: Joi.number().min(1).optional(),
  averageSpeed: Joi.number().min(1).optional(),
});

/**
 * @swagger
 * /routes:
 *   get:
 *     summary: Search routes or get all routes
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: routeNumber
 *         schema:
 *           type: string
 *         description: The route number to filter by
 *       - in: query
 *         name: startLocation
 *         schema:
 *           type: string
 *         description: The start location to filter by
 *       - in: query
 *         name: endLocation
 *         schema:
 *           type: string
 *         description: The end location to filter by
 *       - in: query
 *         name: stopName
 *         schema:
 *           type: string
 *         description: A specific stop name to filter by (returns routes containing this stop)
 *       - in: query
 *         name: variant
 *         schema:
 *           type: string
 *           enum: [EXPRESS, REGULAR]
 *         description: The variant of the route (e.g., EXPRESS or REGULAR)
 *     responses:
 *       200:
 *         description: List of routes matching the search criteria or all routes if no criteria are provided
 *       500:
 *         description: Internal server error
 */
router.get(
  '/',
  authenticateToken,
  (req, res, next) => {
    logger.info('Fetching routes with filters:', req.query);
    next();
  },
  routeController.searchRoutes
);

/**
 * @swagger
 * /routes:
 *   post:
 *     summary: Create a new route
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               routeNumber:
 *                 type: string
 *               startLocation:
 *                 type: string
 *               endLocation:
 *                 type: string
 *               stops:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     stopName:
 *                       type: string
 *                     stopType:
 *                       type: string
 *                       enum: [REGULAR, MAJOR]
 *                     gpsCoordinates:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                         longitude:
 *                           type: number
 *               variant:
 *                 type: string
 *                 enum: [EXPRESS, REGULAR]
 *               duration:
 *                 type: number
 *               distance:
 *                 type: number
 *               averageSpeed:
 *                 type: number
 *     responses:
 *       201:
 *         description: Route created successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized access
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles(['admin']),
  validateRequest(createRouteValidationSchema),
  (req, res, next) => {
    logger.info(`Creating a new route: ${JSON.stringify(req.body)}`);
    next();
  },
  routeController.createRoute
);

/**
 * @swagger
 * /routes/{id}:
 *   put:
 *     summary: Update a route by ID
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the route to update
 *     responses:
 *       200:
 *         description: Route updated successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized access
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  validateRequest(updateRouteValidationSchema),
  (req, res, next) => {
    logger.info(`Updating route with ID ${req.params.id}: ${JSON.stringify(req.body)}`);
    next();
  },
  routeController.updateRoute
);

/**
 * @swagger
 * /routes/{id}:
 *   delete:
 *     summary: Delete a route by ID
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the route to delete
 *     responses:
 *       200:
 *         description: Route deleted successfully
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
    logger.info(`Deleting route with ID ${req.params.id}`);
    next();
  },
  routeController.deleteRoute
);

module.exports = router;

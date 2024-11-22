const express = require('express');
const routeController = require('../controllers/routeController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Routes
 *   description: Route management endpoints
 */

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
router.get('/', authenticateToken, routeController.searchRoutes);

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
 *                 description: The total distance of the route in kilometers
 *               averageSpeed:
 *                 type: number
 *                 description: The average speed for the route in km/h
 *     responses:
 *       201:
 *         description: Route created successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized access
 */
router.post('/', authenticateToken, authorizeRoles(['admin']), routeController.createRoute);

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
 *                 description: The total distance of the route in kilometers
 *               averageSpeed:
 *                 type: number
 *                 description: The average speed for the route in km/h
 *     responses:
 *       200:
 *         description: Route updated successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized access
 */
router.put('/:id', authenticateToken, authorizeRoles(['admin']), routeController.updateRoute);

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
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), routeController.deleteRoute);

module.exports = router;

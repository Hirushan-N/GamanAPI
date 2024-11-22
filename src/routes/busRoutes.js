const express = require('express');
const busController = require('../controllers/busController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');
const Joi = require('joi');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Buses
 *   description: Bus management endpoints
 */

// Validation schemas for buses
const createBusValidationSchema = Joi.object({
  busNumber: Joi.string().required().example('NA-1234'),
  capacity: Joi.number().integer().min(1).required().example(52),
  operatorId: Joi.string().required(),
  ownershipType: Joi.string().valid('SLTB', 'PRIVATE').required().example('SLTB'),
  status: Joi.string().valid('ACTIVE', 'MAINTENANCE').default('ACTIVE'),
});

const updateBusValidationSchema = Joi.object({
  busNumber: Joi.string().optional(),
  capacity: Joi.number().integer().min(1).optional(),
  operatorId: Joi.string().optional(),
  ownershipType: Joi.string().valid('SLTB', 'PRIVATE').optional(),
  status: Joi.string().valid('ACTIVE', 'MAINTENANCE').optional(),
});

/**
 * @swagger
 * /buses:
 *   get:
 *     summary: Search buses or get all buses
 *     tags: [Buses]
 *     parameters:
 *       - in: query
 *         name: busNumber
 *         schema:
 *           type: string
 *         description: The bus number to filter by
 *       - in: query
 *         name: capacity
 *         schema:
 *           type: number
 *         description: The capacity of the bus to filter by
 *       - in: query
 *         name: operatorId
 *         schema:
 *           type: string
 *         description: The operator ID to filter by
 *       - in: query
 *         name: ownershipType
 *         schema:
 *           type: string
 *           enum: [SLTB, PRIVATE]
 *         description: The ownership type (SLTB or PRIVATE) to filter by
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, MAINTENANCE]
 *         description: Filter buses by their status
 *     responses:
 *       200:
 *         description: List of buses matching the search criteria or all buses if no criteria are provided
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, authorizeRoles(['operator', 'admin']), (req, res, next) => {
  logger.info('Fetching buses with filters:', req.query);
  next();
}, busController.searchBuses);

/**
 * @swagger
 * /buses:
 *   post:
 *     summary: Create a new bus
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               busNumber:
 *                 type: string
 *                 example: "NA-1234"
 *               capacity:
 *                 type: number
 *                 example: 52
 *               operatorId:
 *                 type: string
 *                 description: ID of the operator
 *               ownershipType:
 *                 type: string
 *                 enum: [SLTB, PRIVATE]
 *                 example: "SLTB"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, MAINTENANCE]
 *                 example: "ACTIVE"
 *     responses:
 *       201:
 *         description: Bus created successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized access
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles(['operator']),
  validateRequest(createBusValidationSchema),
  (req, res, next) => {
    logger.info(`Creating a new bus: ${JSON.stringify(req.body)}`);
    next();
  },
  busController.createBus
);

/**
 * @swagger
 * /buses/{id}:
 *   put:
 *     summary: Update a bus by ID
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the bus to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               busNumber:
 *                 type: string
 *               capacity:
 *                 type: number
 *               operatorId:
 *                 type: string
 *               ownershipType:
 *                 type: string
 *                 enum: [SLTB, PRIVATE]
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, MAINTENANCE]
 *     responses:
 *       200:
 *         description: Bus updated successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized access
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles(['operator']),
  validateRequest(updateBusValidationSchema),
  (req, res, next) => {
    logger.info(`Updating bus with ID ${req.params.id}: ${JSON.stringify(req.body)}`);
    next();
  },
  busController.updateBus
);

/**
 * @swagger
 * /buses/{id}:
 *   delete:
 *     summary: Delete a bus by ID
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the bus to delete
 *     responses:
 *       200:
 *         description: Bus deleted successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized access
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(['operator']),
  (req, res, next) => {
    logger.info(`Deleting bus with ID ${req.params.id}`);
    next();
  },
  busController.deleteBus
);

module.exports = router;

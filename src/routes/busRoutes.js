const express = require('express');
const busController = require('../controllers/busController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Buses
 *   description: Bus management endpoints
 */

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
router.get('/', busController.searchBuses);

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
router.post('/', authenticateToken, authorizeRoles(['operator']), busController.createBus);

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
router.put('/:id', authenticateToken, authorizeRoles(['operator']), busController.updateBus);

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
router.delete('/:id', authenticateToken, authorizeRoles(['operator']), busController.deleteBus);

module.exports = router;

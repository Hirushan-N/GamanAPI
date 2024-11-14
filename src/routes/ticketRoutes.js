const express = require('express');
const ticketController = require('../controllers/ticketController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket management endpoints
 */

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Search tickets by query parameters
 *     tags: [Tickets]
 *     parameters:
 *       - in: query
 *         name: commuterPhone
 *         schema:
 *           type: string
 *         description: The phone number of the commuter
 *       - in: query
 *         name: tripId
 *         schema:
 *           type: string
 *         description: The ID of the trip
 *       - in: query
 *         name: busId
 *         schema:
 *           type: string
 *         description: The ID of the bus
 *       - in: query
 *         name: routeId
 *         schema:
 *           type: string
 *         description: The ID of the route
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: The status of the ticket (e.g., pending, confirmed, cancelled)
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *         description: The payment status of the ticket (e.g., pending, completed, failed)
 *     responses:
 *       200:
 *         description: List of tickets matching the search criteria
 *       500:
 *         description: Internal server error
 */
router.get('/', authorizeRoles(['commuter']), ticketController.searchTickets);

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create a new ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commuterPhone:
 *                 type: string
 *               tripId:
 *                 type: string
 *               busId:
 *                 type: string
 *               routeId:
 *                 type: string
 *               seatNumber:
 *                 type: number
 *               paymentType:
 *                 type: string
 *                 enum: ['cash', 'card', 'online']
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', authorizeRoles(['commuter']), ticketController.createTicket);

/**
 * @swagger
 * /tickets/confirm:
 *   post:
 *     summary: Confirm a ticket using OTP
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ticketId:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket confirmed successfully
 *       400:
 *         description: Invalid OTP or bad request
 *       404:
 *         description: Ticket not found
 */
router.post('/confirm', authorizeRoles(['commuter']), ticketController.confirmTicket);

/**
 * @swagger
 * /tickets/{id}:
 *   put:
 *     summary: Update a ticket by ID
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the ticket to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seatNumber:
 *                 type: number
 *               paymentType:
 *                 type: string
 *                 enum: ['cash', 'card', 'online']
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *       400:
 *         description: Bad request or confirmed ticket cannot be updated
 *       404:
 *         description: Ticket not found
 */
router.put('/:id', authorizeRoles(['commuter']), ticketController.updateTicket);

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Delete a ticket by ID
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the ticket to delete
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *       400:
 *         description: Bad request or confirmed ticket cannot be deleted
 *       404:
 *         description: Ticket not found
 */
router.delete('/:id',authorizeRoles(['commuter']), ticketController.deleteTicket);

module.exports = router;

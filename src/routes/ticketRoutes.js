const express = require('express');
const ticketController = require('../controllers/ticketController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const logger = require('../utils/logger');
const Joi = require('joi');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket management endpoints
 */

// Validation schemas for tickets
const createTicketValidationSchema = Joi.object({
  commuterPhone: Joi.string().pattern(/^\d{10}$/).required().example('0712345678'),
  scheduleEntryId: Joi.string().required(),
  busId: Joi.string().required(),
  routeId: Joi.string().required(),
  seatNumber: Joi.number().integer().min(1).required(),
  paymentType: Joi.string().valid('cash', 'card', 'online').required(),
});

const confirmTicketValidationSchema = Joi.object({
  ticketId: Joi.string().required(),
  otp: Joi.string().length(4).required(),
});

const updateTicketValidationSchema = Joi.object({
  seatNumber: Joi.number().integer().min(1).optional(),
  paymentType: Joi.string().valid('cash', 'card', 'online').optional(),
});

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
 *         name: scheduleEntryId
 *         schema:
 *           type: string
 *         description: The ID of the scheduleEntry
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
router.get(
  '/',
  authenticateToken,
  authorizeRoles(['commuter']),
  (req, res, next) => {
    logger.info('Fetching tickets with filters:', req.query);
    next();
  },
  ticketController.searchTickets
);

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
 *               scheduleEntryId:
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
router.post(
  '/',
  authenticateToken,
  authorizeRoles(['commuter']),
  validateRequest(createTicketValidationSchema),
  (req, res, next) => {
    logger.info(`Creating a new ticket: ${JSON.stringify(req.body)}`);
    next();
  },
  ticketController.createTicket
);

/**
 * @swagger
 * /tickets/{id}:
 *   patch:
 *     summary: Update a ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ['confirmed']
 *               otp:
 *                 type: string
 *               seatNumber:
 *                 type: number
 *               paymentType:
 *                 type: string
 *                 enum: ['cash', 'card', 'online']
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 */
router.patch(
  '/:id',
  authenticateToken,
  authorizeRoles(['commuter']),
  validateRequest(updateTicketValidationSchema),
  (req, res, next) => {
    logger.info(`Updating ticket with ID: ${req.params.id}`);
    next();
  },
  ticketController.updateTicket
);

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
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles(['commuter']),
  (req, res, next) => {
    logger.info(`Deleting ticket with ID: ${req.params.id}`);
    next();
  },
  ticketController.deleteTicket
);

module.exports = router;

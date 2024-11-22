const Ticket = require('../models/Ticket');
const TripSchedule = require('../models/TripSchedule');
const Joi = require('joi');
const logger = require('../utils/logger');

// Joi validation schemas
const ticketSchema = Joi.object({
  commuterPhone: Joi.string().pattern(/^\d{10}$/).required(), // Example: Validates a 10-digit phone number
  tripId: Joi.string().required(),
  busId: Joi.string().required(),
  routeId: Joi.string().required(),
  seatNumber: Joi.number().integer().min(1).required(),
  paymentType: Joi.string().valid('cash', 'card', 'online').required(),
});

exports.searchTickets = async (req, res) => {
  try {
    const filter = {};
    if (req.query.commuterPhone) filter.commuterPhone = req.query.commuterPhone;
    if (req.query.tripId) filter.tripId = req.query.tripId;
    if (req.query.busId) filter.busId = req.query.busId;
    if (req.query.routeId) filter.routeId = req.query.routeId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

    const tickets = await Ticket.find(filter).populate('tripId busId routeId');
    res.status(200).json(tickets);
  } catch (error) {
    logger.error(`Error searching tickets: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

exports.createTicket = async (req, res) => {
  try {
    // Validate request body
    const { error } = ticketSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Validation failed', details: error.details.map((e) => e.message) });
    }

    const { commuterPhone, tripId, busId, routeId, seatNumber, paymentType } = req.body;

    // Check if the trip exists
    const trip = await TripSchedule.findById(tripId).populate('busId');
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Validate seat availability
    const seatTaken = await Ticket.findOne({ tripId, seatNumber });
    if (seatTaken) {
      return res.status(400).json({ error: 'Seat already booked.' });
    }

    // Check if the bus capacity is exceeded
    const totalBookedSeats = await Ticket.countDocuments({ tripId });
    if (totalBookedSeats >= trip.busId.capacity) {
      return res.status(400).json({ error: 'Bus capacity exceeded.' });
    }

    // Generate a dynamic OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Create a new ticket
    const ticket = new Ticket({
      commuterPhone,
      tripId,
      busId,
      routeId,
      seatNumber,
      paymentType,
      otp,
    });

    await ticket.save();
    logger.info(`Ticket created successfully: ${ticket._id}`);
    res.status(201).json({ message: 'Ticket created successfully. OTP sent to the commuter.', ticketId: ticket._id });
  } catch (error) {
    logger.error(`Error creating ticket: ${error.message}`);
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

exports.confirmTicket = async (req, res) => {
  try {
    const { ticketId, otp } = req.body;
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    if (ticket.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    ticket.status = 'confirmed';
    ticket.paymentStatus = 'completed';
    ticket.otp = null; // Clear OTP after confirmation
    await ticket.save();

    logger.info(`Ticket confirmed successfully: ${ticketId}`);
    res.status(200).json({ message: 'Ticket confirmed successfully', ticket });
  } catch (error) {
    logger.error(`Error confirming ticket: ${error.message}`);
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the ticket to validate status
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    if (ticket.status === 'confirmed') {
      return res.status(400).json({ error: 'Confirmed tickets cannot be updated.' });
    }

    // Update the ticket
    const updatedTicket = await Ticket.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    logger.info(`Ticket updated successfully: ${id}`);
    res.status(200).json({ message: 'Ticket updated successfully', ticket: updatedTicket });
  } catch (error) {
    logger.error(`Error updating ticket: ${error.message}`);
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the ticket to validate status
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    if (ticket.status === 'confirmed') {
      return res.status(400).json({ error: 'Confirmed tickets cannot be deleted.' });
    }

    // Delete the ticket
    await Ticket.findByIdAndDelete(id);
    logger.info(`Ticket deleted successfully: ${id}`);
    res.status(200).json({ message: 'Ticket deleted successfully.' });
  } catch (error) {
    logger.error(`Error deleting ticket: ${error.message}`);
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

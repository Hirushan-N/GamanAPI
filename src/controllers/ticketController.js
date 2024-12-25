const Ticket = require('../models/Ticket');
const ScheduleEntry = require('../models/ScheduleEntry');
const Joi = require('joi');
const logger = require('../utils/logger');

// Joi validation schemas
const ticketSchema = Joi.object({
  commuterPhone: Joi.string().pattern(/^\d{10}$/).required(), // Example: Validates a 10-digit phone number
  scheduleEntryId: Joi.string().required(),
  busId: Joi.string().required(),
  routeId: Joi.string().required(),
  seatNumber: Joi.number().integer().min(1).required(),
  paymentType: Joi.string().valid('cash', 'card', 'online').required(),
});

exports.searchTickets = async (req, res) => {
  try {
    const filter = {};
    if (req.query.commuterPhone) filter.commuterPhone = req.query.commuterPhone;
    if (req.query.scheduleEntryId) filter.scheduleEntryId = req.query.scheduleEntryId;
    if (req.query.busId) filter.busId = req.query.busId;
    if (req.query.routeId) filter.routeId = req.query.routeId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

    const tickets = await Ticket.find(filter).populate('scheduleEntryId busId routeId');
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

    const { commuterPhone, scheduleEntryId, busId, routeId, seatNumber, paymentType, travelDate } = req.body;

    // Check if the scheduleEntry exists
    const scheduleEntry = await ScheduleEntry.findById(scheduleEntryId).populate('busId');
    if (!scheduleEntry) {
      return res.status(404).json({ error: 'Schedule entry not found' });
    }

    // Check if the ticketSaleEndTime has passed
    const now = new Date();
    const ticketSaleEndTime = scheduleEntry.ticketSaleEndTime || new Date(scheduleEntry.departureTime.getTime() - 60 * 60 * 1000);
    if (now > ticketSaleEndTime) {
      return res.status(400).json({ error: 'Tickets cannot be created after the sale end time has passed.' });
    }

    // Validate seat availability
    const seatTaken = await Ticket.findOne({ scheduleEntryId, seatNumber, travelDate });
    if (seatTaken) {
      return res.status(400).json({ error: 'Seat already booked.' });
    }

    // Check if the bus capacity is exceeded
    const totalBookedSeats = await Ticket.countDocuments({ scheduleEntryId, travelDate });
    if (totalBookedSeats >= scheduleEntry.busId.capacity) {
      return res.status(400).json({ error: 'Bus capacity exceeded.' });
    }

    // Generate a dynamic OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Create a new ticket
    const ticket = new Ticket({
      commuterPhone,
      scheduleEntryId,
      busId,
      routeId,
      seatNumber,
      paymentType,
      otp,
      travelDate,
    });

    await ticket.save();
    logger.info(`Ticket created successfully: ${ticket._id}`);
    res.status(201).json({ message: 'Ticket created successfully. OTP sent to the commuter.', ticketId: ticket._id });
  } catch (error) {
    logger.error(`Error creating ticket: ${error.message}`);
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

// Confirm or Update Ticket
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, otp, seatNumber, paymentType } = req.body;

    // Fetch the ticket from the database
    const ticket = await Ticket.findById(id).populate('scheduleEntryId');
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if the ticket is expired
    const today = new Date();
    const travelDate = new Date(ticket.travelDate);
    travelDate.setHours(0, 0, 0, 0); // Normalize travel date to start of the day

    const scheduleEntry = ticket.scheduleEntryId;
    if (!scheduleEntry) {
      return res.status(404).json({ error: 'Associated schedule entry not found.' });
    }

    const ticketSaleEndTime = new Date(scheduleEntry.ticketSaleEndTime);

    if (travelDate < today || (travelDate.toDateString() === today.toDateString() && ticketSaleEndTime < today)) {
      return res.status(400).json({ error: 'Ticket is expired and cannot be updated.' });
    }

    // Check if the ticket is already confirmed
    if (ticket.status === 'confirmed') {
      return res.status(400).json({ error: 'Ticket is already confirmed and cannot be updated.' });
    }

    // Handle confirmation logic if requested
    if (status === 'confirmed') {
      // Validate the OTP
      if (ticket.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      // Update status to confirmed
      ticket.status = 'confirmed';
      ticket.otp = null;
    }

    // Update other fields if provided
    if (seatNumber) ticket.seatNumber = seatNumber;
    if (paymentType) ticket.paymentType = paymentType;

    // Save the ticket with updates
    await ticket.save();

    logger.info(`Ticket updated successfully: ${id}`);
    res.status(200).json({ message: 'Ticket updated successfully', ticket });
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

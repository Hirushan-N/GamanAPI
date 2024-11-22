const Ticket = require('../models/Ticket');
const TripSchedule = require('../models/TripSchedule');
const Bus = require('../models/Bus');

/**
 * Search Tickets
 * Provides dynamic filtering for tickets based on query parameters
 */
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
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

/**
 * Create a Ticket
 * Validates seat availability and bus capacity
 */
exports.createTicket = async (req, res) => {
  try {
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

    // Create a new ticket
    const ticket = new Ticket({
      commuterPhone,
      tripId,
      busId,
      routeId,
      seatNumber,
      paymentType,
      otp: '1234', // OTP can be dynamically generated if required
    });

    await ticket.save();
    res.status(201).json({ message: 'Ticket created. OTP sent to the commuter.', ticketId: ticket._id });
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

/**
 * Confirm a Ticket
 * Validates OTP and updates ticket status to confirmed
 */
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

    res.status(200).json({ message: 'Ticket confirmed successfully', ticket });
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

/**
 * Update a Ticket
 * Prevents updates to confirmed tickets
 */
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
    res.status(200).json({ message: 'Ticket updated successfully', ticket: updatedTicket });
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

/**
 * Delete a Ticket
 * Prevents deletion of confirmed tickets
 */
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
    res.status(200).json({ message: 'Ticket deleted successfully.' });
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

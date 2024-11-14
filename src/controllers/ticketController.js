const Ticket = require('../models/Ticket');
const TripSchedule = require('../models/TripSchedule');

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
      res.status(500).json({ error: error.message });
    }
};

exports.createTicket = async (req, res) => {
  try {
    const { commuterPhone, tripId, busId, routeId, seatNumber, paymentType } = req.body;

    // Check if the trip exists
    const trip = await TripSchedule.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const ticket = new Ticket({ 
      commuterPhone, 
      tripId, 
      busId, 
      routeId, 
      seatNumber, 
      paymentType, 
      otp: '1234'
    });
    await ticket.save();
    res.status(201).json({ message: 'Ticket created. OTP sent to the commuter.', ticketId: ticket._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
    ticket.otp = null; 
    await ticket.save();
    res.status(200).json({ message: 'Ticket confirmed', ticket });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    if (ticket.status === 'confirmed') {
      return res.status(400).json({ error: 'Confirmed tickets cannot be updated' });
    }

    // Update ticket details if not confirmed
    const updatedTicket = await Ticket.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: 'Ticket updated successfully', ticket: updatedTicket });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    if (ticket.status === 'confirmed') {
      return res.status(400).json({ error: 'Confirmed tickets cannot be deleted' });
    }

    // Delete ticket if not confirmed
    await Ticket.findByIdAndDelete(id);
    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

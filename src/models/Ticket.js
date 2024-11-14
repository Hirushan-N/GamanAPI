const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  commuterPhone: { type: String, required: true },
  otp: { type: String },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'TripSchedule', required: true },
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  seatNumber: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentType: { type: String, enum: ['cash', 'card', 'online'], required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);

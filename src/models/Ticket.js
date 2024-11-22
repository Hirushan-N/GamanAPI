const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    commuterPhone: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^\d{10}$/.test(value); // Example: Validates a 10-digit phone number
        },
        message: 'Commuter phone must be a valid 10-digit number.',
      },
    },
    otp: { type: String },
    tripId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'TripSchedule', 
      required: true 
    },
    busId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Bus', 
      required: true 
    },
    routeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Route', 
      required: true 
    },
    seatNumber: { 
      type: Number, 
      required: true,
      min: [1, 'Seat number must be greater than or equal to 1.'],
    },
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'cancelled'], 
      default: 'pending' 
    },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'completed', 'failed'], 
      default: 'pending' 
    },
    paymentType: { 
      type: String, 
      enum: ['cash', 'card', 'online'], 
      required: true 
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to validate seat capacity and duplicate tickets
ticketSchema.pre('save', async function (next) {
  const Ticket = mongoose.model('Ticket');
  const Bus = mongoose.model('Bus');

  // Ensure seat number is within the bus capacity
  const bus = await Bus.findById(this.busId);
  if (!bus) {
    return next(new Error('Bus not found.'));
  }
  if (this.seatNumber < 1 || this.seatNumber > bus.capacity) {
    return next(new Error(`Seat number must be between 1 and ${bus.capacity}.`));
  }

  // Check for duplicate ticket for the same trip and seat
  const existingTicket = await Ticket.findOne({
    tripId: this.tripId,
    seatNumber: this.seatNumber,
  });

  if (existingTicket) {
    return next(new Error('A ticket already exists for this seat on the specified trip.'));
  }

  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);

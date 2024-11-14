const mongoose = require('mongoose');

const tripScheduleSchema = new mongoose.Schema({
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  tripId: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  departureTime: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('TripSchedule', tripScheduleSchema);

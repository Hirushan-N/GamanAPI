const mongoose = require('mongoose');

const tripScheduleSchema = new mongoose.Schema({
  tripName: { type: String, required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  stopsSchedule: [
    {
      stop: { type: String, required: true },
      time: { type: Date, required: true }
    }
  ],
  activeDays: { type: [String], enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], required: true },
  totalBookings: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, {
  timestamps: true
});

module.exports = mongoose.model('TripSchedule', tripScheduleSchema);

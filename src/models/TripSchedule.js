const mongoose = require('mongoose');

// Sub-schema for stop schedule
const stopScheduleSchema = new mongoose.Schema({
  stop: { 
    type: String, 
    required: true, 
    trim: true 
  },
  time: { 
    type: Date, 
    required: true 
  },
});

const tripScheduleSchema = new mongoose.Schema(
  {
    tripName: { 
      type: String, 
      required: true,
      trim: true 
    },
    routeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Route', 
      required: true 
    },
    busId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Bus', 
      required: true 
    },
    departureTime: { 
      type: Date, 
      required: true 
    },
    arrivalTime: { 
      type: Date, 
      required: true 
    },
    stopsSchedule: [stopScheduleSchema],
    activeDays: { 
      type: [String], 
      enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], 
      required: true 
    },
    totalBookings: { 
      type: Number, 
      default: 0 
    },
    status: { 
      type: String, 
      enum: ['ACTIVE', 'INACTIVE'], 
      default: 'ACTIVE' 
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook for logical validations
tripScheduleSchema.pre('save', function (next) {
  if (this.arrivalTime <= this.departureTime) {
    return next(new Error('Arrival time must be after departure time.'));
  }

  // Validate stops schedule times
  for (const stop of this.stopsSchedule) {
    if (stop.time <= this.departureTime || stop.time >= this.arrivalTime) {
      return next(
        new Error(
          `Stop time (${stop.time}) for stop "${stop.stop}" must be between departure time and arrival time.`
        )
      );
    }
  }

  // Check for duplicate stop names
  const stopNames = this.stopsSchedule.map((stop) => stop.stop);
  const uniqueStopNames = new Set(stopNames);
  if (stopNames.length !== uniqueStopNames.size) {
    return next(new Error('Duplicate stop names detected in the stops schedule.'));
  }

  next();
});

module.exports = mongoose.model('TripSchedule', tripScheduleSchema);

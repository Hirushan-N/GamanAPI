const mongoose = require('mongoose');

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

const scheduleEntrySchema = new mongoose.Schema(
  {
    scheduleId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Schedule', 
      required: true 
    },
    busId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Bus', 
      required: true 
    },
    departureTerminal: { 
      type: String, 
      required: true, 
      trim: true 
    },
    arrivalTerminal: { 
      type: String, 
      required: true, 
      trim: true 
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
    ticketSaleEndTime: { 
      type: Date,
      default: function () {
        // Default to 1 hour before departure time if not provided
        return new Date(this.departureTime.getTime() - 60 * 60 * 1000);
      }
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to enforce ticketSaleEndTime logic
scheduleEntrySchema.pre('save', function (next) {
  if (!this.ticketSaleEndTime) {
    // Set default to 1 hour before departure time if not provided
    this.ticketSaleEndTime = new Date(this.departureTime.getTime() - 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('ScheduleEntry', scheduleEntrySchema);

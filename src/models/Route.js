const mongoose = require('mongoose');

// Sub-schema for stop details
const stopDetailsSchema = new mongoose.Schema({
  stopName: { 
    type: String, 
    required: true,
    trim: true 
  },
  stopType: { 
    type: String, 
    enum: ['REGULAR', 'MAJOR'], 
    default: 'REGULAR' 
  },
  gpsCoordinates: {
    latitude: { 
      type: Number,
      min: -90,
      max: 90,
      validate: {
        validator: function (value) {
          return value !== undefined;
        },
        message: 'Latitude must be a valid value between -90 and 90.',
      },
    },
    longitude: { 
      type: Number,
      min: -180,
      max: 180,
      validate: {
        validator: function (value) {
          return value !== undefined;
        },
        message: 'Longitude must be a valid value between -180 and 180.',
      },
    },
  },
});

// Main route schema
const routeSchema = new mongoose.Schema(
  {
    routeNumber: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true 
    },
    startLocation: { 
      type: String, 
      required: true 
    },
    endLocation: { 
      type: String, 
      required: true 
    },
    stops: [stopDetailsSchema],
    variant: { 
      type: String, 
      enum: ['EXPRESS', 'REGULAR'], 
      default: 'REGULAR' 
    },
    distance: { 
      type: Number, 
      required: true,
      min: [1, 'Distance must be greater than 0.'],
    },
    averageSpeed: { 
      type: Number, 
      required: true,
      min: [1, 'Average speed must be greater than 0.'],
    },
    duration: { 
      type: Number, 
      required: true,
      min: [1, 'Duration must be greater than 0.'],
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
routeSchema.pre('save', function (next) {
  if (this.startLocation === this.endLocation) {
    return next(new Error('Start location and end location cannot be the same.'));
  }

  const calculatedDuration = this.distance / this.averageSpeed;
  if (Math.abs(calculatedDuration - this.duration) > 0.1) {
    return next(new Error('Duration does not match distance and average speed.'));
  }

  next();
});

module.exports = mongoose.model('Route', routeSchema);

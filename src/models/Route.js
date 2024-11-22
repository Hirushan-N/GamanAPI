const mongoose = require('mongoose');

const stopDetailsSchema = new mongoose.Schema({
  stopName: { type: String, required: true },
  stopType: { type: String, enum: ['REGULAR', 'MAJOR'], default: 'REGULAR' },
  gpsCoordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  }
});

const routeSchema = new mongoose.Schema({
  routeNumber: { type: String, required: true, unique: true },
  startLocation: { type: String, required: true },
  endLocation: { type: String, required: true },
  stops: [stopDetailsSchema],
  variant: { type: String, enum: ['EXPRESS', 'REGULAR'], default: 'REGULAR' },
  distance: { type: Number, required: true },
  averageSpeed: { type: Number, required: true },
  duration: { type: Number, required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, {
  timestamps: trueA
});

module.exports = mongoose.model('Route', routeSchema);

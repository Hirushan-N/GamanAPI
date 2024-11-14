const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeNumber: { type: String, required: true, unique: true },
  startLocation: { type: String, required: true },
  endLocation: { type: String, required: true },
  stops: [{ type: String, required: true }],
  distance: { type: Number, required: true },
  averageSpeed: { type: Number, required: true },
  duration: { type: Number, required: true }
});

module.exports = mongoose.model('Route', routeSchema);

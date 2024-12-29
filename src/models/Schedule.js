const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    scheduleName: { 
      type: String, 
      required: true, 
      trim: true 
    },
    routeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Route', 
      required: true 
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

module.exports = mongoose.model('Schedule', scheduleSchema);

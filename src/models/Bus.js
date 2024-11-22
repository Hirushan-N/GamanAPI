const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownershipType: { type: String, enum: ['SLTB', 'PRIVATE'], required: true },
  status: { type: String, enum: ['ACTIVE', 'MAINTENANCE'], default: 'ACTIVE' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bus', busSchema);

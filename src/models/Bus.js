const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value) {
          return /^[A-Z0-9-]+$/.test(value); // Example: Ensures uppercase letters, digits, and hyphens
        },
        message: 'Bus number must contain only uppercase letters, digits, and hyphens.',
      },
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1'],
      max: [100, 'Capacity cannot exceed 100'], // Logical limit for capacity
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownershipType: {
      type: String,
      enum: ['SLTB', 'PRIVATE'],
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'MAINTENANCE'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to normalize `busNumber` (e.g., convert to uppercase)
busSchema.pre('save', function (next) {
  if (this.isModified('busNumber')) {
    this.busNumber = this.busNumber.toUpperCase(); // Normalize to uppercase
  }
  next();
});

module.exports = mongoose.model('Bus', busSchema);

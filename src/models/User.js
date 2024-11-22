const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true, 
      minlength: 3, 
      maxlength: 30 
    },
    password: { 
      type: String, 
      required: true,
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(value);
        },
        message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.',
      },
    },
    role: { 
      type: String, 
      enum: ['admin', 'operator', 'commuter'], 
      default: 'commuter' 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      match: /^\S+@\S+\.\S+$/ 
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook for hashing passwords
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err); // Pass error to the next middleware
  }
});

// Method to compare password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

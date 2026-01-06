import mongoose from 'mongoose';

/**
 * Service Schema
 */
const serviceSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StoreAccount',
      required: [true, 'Please provide store ID']
    },
    name: {
      type: String,
      required: [true, 'Please provide service name'],
      trim: true,
      maxlength: [100, 'Service name cannot be more than 100 characters']
    },
    ratePerSecond: {
      type: Number,
      default: 0
    },
    ratePerMinute: {
      type: Number,
      required: true,
      min: [0, 'Rate per minute cannot be negative']
    },
    minBalanceRequired: {
      type: Number,
      required: [true, 'Please provide minimum balance required'],
      min: [0, 'Minimum balance cannot be negative']
    },
    qrCodeId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
serviceSchema.index({ storeId: 1 });
serviceSchema.index({ isActive: 1 });

// Virtual for rate per minute (Removed as it is now a field)


// Virtual for rate per hour
serviceSchema.virtual('ratePerHour').get(function () {
  return this.ratePerSecond * 3600;
});

// Static method - find services by store
serviceSchema.statics.findByStore = function (storeId) {
  return this.find({ storeId, isActive: true });
};

// Static method - find service by QR code
serviceSchema.statics.findByQrCode = function (qrCodeId) {
  return this.findOne({ qrCodeId, isActive: true });
};

// Instance method - calculate cost for duration
serviceSchema.methods.calculateCost = function (durationSeconds) {
  return this.ratePerSecond * durationSeconds;
};

// Instance method - check if user can afford minimum balance
serviceSchema.methods.canUserAfford = function (userBalance) {
  return userBalance >= this.minBalanceRequired;
};

// Ensure virtuals are included in JSON
serviceSchema.set('toJSON', { virtuals: true });
serviceSchema.set('toObject', { virtuals: true });

const Service = mongoose.model('Service', serviceSchema);

export default Service;


import mongoose from 'mongoose';

/**
 * StreamSession Schema
 */
const streamSessionSchema = new mongoose.Schema(
  {
    userWalletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: [true, 'Please provide user wallet ID']
    },
    storeWalletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: [true, 'Please provide store wallet ID']
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Please provide service ID']
    },
    ratePerSecond: {
      type: Number,
      required: [true, 'Please provide rate per second'],
      min: [0, 'Rate per second cannot be negative']
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    lastBilledAt: {
      type: Date,
      default: Date.now
    },
    endedAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'PAUSED', 'ENDED'],
        message: 'Status must be ACTIVE, PAUSED, or ENDED'
      },
      default: 'ACTIVE'
    },
    totalAmountTransferred: {
      type: Number,
      default: 0,
      min: [0, 'Total amount cannot be negative']
    },
    totalDurationSeconds: {
      type: Number,
      default: 0,
      min: [0, 'Duration cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

// Indexes
streamSessionSchema.index({ userWalletId: 1 });
streamSessionSchema.index({ storeWalletId: 1 });
streamSessionSchema.index({ serviceId: 1 });
streamSessionSchema.index({ status: 1 });
streamSessionSchema.index({ startedAt: -1 });

// Virtual for current duration (if session is active)
streamSessionSchema.virtual('currentDurationSeconds').get(function() {
  if (this.status === 'ENDED') {
    return this.totalDurationSeconds;
  }
  const now = new Date();
  const start = new Date(this.startedAt);
  return Math.floor((now - start) / 1000);
});

// Virtual for unbilled duration
streamSessionSchema.virtual('unbilledDurationSeconds').get(function() {
  if (this.status !== 'ACTIVE') {
    return 0;
  }
  const now = new Date();
  const lastBilled = new Date(this.lastBilledAt);
  return Math.floor((now - lastBilled) / 1000);
});

// Virtual for unbilled amount
streamSessionSchema.virtual('unbilledAmount').get(function() {
  return this.unbilledDurationSeconds * this.ratePerSecond;
});

// Instance method - check if session is active
streamSessionSchema.methods.isSessionActive = function() {
  return this.status === 'ACTIVE';
};

// Instance method - pause session
streamSessionSchema.methods.pause = function() {
  if (this.status !== 'ACTIVE') {
    throw new Error('Can only pause an active session');
  }
  this.status = 'PAUSED';
  return this.save();
};

// Instance method - resume session
streamSessionSchema.methods.resume = function() {
  if (this.status !== 'PAUSED') {
    throw new Error('Can only resume a paused session');
  }
  this.status = 'ACTIVE';
  this.lastBilledAt = new Date();
  return this.save();
};

// Instance method - end session
streamSessionSchema.methods.end = function() {
  if (this.status === 'ENDED') {
    throw new Error('Session is already ended');
  }
  this.status = 'ENDED';
  this.endedAt = new Date();
  return this.save();
};

// Instance method - update billing
streamSessionSchema.methods.updateBilling = function(amount, durationSeconds) {
  this.totalAmountTransferred += amount;
  this.totalDurationSeconds += durationSeconds;
  this.lastBilledAt = new Date();
  return this.save();
};

// Static method - find active sessions for user wallet
streamSessionSchema.statics.findActiveByUserWallet = function(userWalletId) {
  return this.findOne({ userWalletId, status: 'ACTIVE' });
};

// Static method - find active sessions for store wallet
streamSessionSchema.statics.findActiveByStoreWallet = function(storeWalletId) {
  return this.find({ storeWalletId, status: 'ACTIVE' });
};

// Static method - find sessions by service
streamSessionSchema.statics.findByService = function(serviceId) {
  return this.find({ serviceId });
};

// Ensure virtuals are included in JSON
streamSessionSchema.set('toJSON', { virtuals: true });
streamSessionSchema.set('toObject', { virtuals: true });

const StreamSession = mongoose.model('StreamSession', streamSessionSchema);

export default StreamSession;


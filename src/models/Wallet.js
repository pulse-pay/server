import mongoose from 'mongoose';

/**
 * Wallet Schema
 */
const walletSchema = new mongoose.Schema(
  {
    ownerType: {
      type: String,
      required: [true, 'Please provide owner type'],
      enum: {
        values: ['USER', 'STORE'],
        message: 'Owner type must be USER or STORE'
      }
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Please provide owner ID'],
      refPath: 'ownerType' // Dynamic reference based on ownerType
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative']
    },
    lockedBalance: {
      type: Number,
      default: 0,
      min: [0, 'Locked balance cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: {
        values: ['INR', 'USD', 'EUR'],
        message: 'Currency must be INR, USD, or EUR'
      }
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'SUSPENDED'],
        message: 'Status must be ACTIVE or SUSPENDED'
      },
      default: 'ACTIVE'
    },
    activeSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StreamSession',
      default: null
    },
    evmAddress: {
      type: String,
      trim: true,
      default: null
    },
    encryptedPrivateKey: {
      type: String, // In production, never store raw keys. Use a KMS.
      select: false, // Don't return by default
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes
walletSchema.index({ ownerId: 1, ownerType: 1 });
walletSchema.index({ status: 1 });
walletSchema.index({ activeSessionId: 1 });

// Virtual for available balance
walletSchema.virtual('availableBalance').get(function () {
  return this.balance - this.lockedBalance;
});

// Instance method - check if wallet is active
walletSchema.methods.isWalletActive = function () {
  return this.status === 'ACTIVE';
};

// Instance method - check if wallet has sufficient balance
walletSchema.methods.hasSufficientBalance = function (amount) {
  return this.availableBalance >= amount;
};

// Instance method - check if wallet has active session
walletSchema.methods.hasActiveSession = function () {
  return this.activeSessionId !== null;
};

// Static method - find wallet by owner
walletSchema.statics.findByOwner = function (ownerId, ownerType) {
  return this.findOne({ ownerId, ownerType });
};

// Instance method - credit balance
walletSchema.methods.credit = function (amount) {
  this.balance += amount;
  return this.save();
};

// Instance method - debit balance
walletSchema.methods.debit = function (amount) {
  if (!this.hasSufficientBalance(amount)) {
    throw new Error('Insufficient balance');
  }
  this.balance -= amount;
  return this.save();
};

// Instance method - lock balance
walletSchema.methods.lockBalance = function (amount) {
  if (!this.hasSufficientBalance(amount)) {
    throw new Error('Insufficient balance to lock');
  }
  this.lockedBalance += amount;
  return this.save();
};

// Instance method - unlock balance
walletSchema.methods.unlockBalance = function (amount) {
  if (this.lockedBalance < amount) {
    throw new Error('Cannot unlock more than locked balance');
  }
  this.lockedBalance -= amount;
  return this.save();
};

// Ensure virtuals are included in JSON
walletSchema.set('toJSON', { virtuals: true });
walletSchema.set('toObject', { virtuals: true });

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;


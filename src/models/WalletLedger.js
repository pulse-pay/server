import mongoose from 'mongoose';

/**
 * WalletLedger Schema
 */
const walletLedgerSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: [true, 'Please provide wallet ID']
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StreamSession',
      default: null
    },
    direction: {
      type: String,
      required: [true, 'Please provide transaction direction'],
      enum: {
        values: ['DEBIT', 'CREDIT'],
        message: 'Direction must be DEBIT or CREDIT'
      }
    },
    amount: {
      type: Number,
      required: [true, 'Please provide amount'],
      min: [0, 'Amount cannot be negative']
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason'],
      enum: {
        values: [
          'GYM_STREAM',
          'EV_STREAM',
          'WIFI_STREAM',
          'PARKING_STREAM',
          'WALLET_TOPUP',
          'WALLET_WITHDRAWAL',
          'REFUND',
          'ADJUSTMENT'
        ],
        message: 'Invalid reason'
      }
    },
    balanceAfter: {
      type: Number,
      required: [true, 'Please provide balance after transaction']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexes
walletLedgerSchema.index({ walletId: 1 });
walletLedgerSchema.index({ sessionId: 1 });
walletLedgerSchema.index({ direction: 1 });
walletLedgerSchema.index({ reason: 1 });
walletLedgerSchema.index({ timestamp: -1 });
walletLedgerSchema.index({ walletId: 1, timestamp: -1 });

// Static method - find ledger entries by wallet
walletLedgerSchema.statics.findByWallet = function(walletId, options = {}) {
  const query = this.find({ walletId });
  
  if (options.limit) {
    query.limit(options.limit);
  }
  if (options.skip) {
    query.skip(options.skip);
  }
  
  return query.sort({ timestamp: -1 });
};

// Static method - find ledger entries by session
walletLedgerSchema.statics.findBySession = function(sessionId) {
  return this.find({ sessionId }).sort({ timestamp: -1 });
};

// Static method - get wallet balance history
walletLedgerSchema.statics.getBalanceHistory = function(walletId, startDate, endDate) {
  const query = { walletId };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }
  
  return this.find(query).sort({ timestamp: 1 });
};

// Static method - get total debits for wallet
walletLedgerSchema.statics.getTotalDebits = async function(walletId, startDate, endDate) {
  const match = { walletId: new mongoose.Types.ObjectId(walletId), direction: 'DEBIT' };
  
  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = startDate;
    if (endDate) match.timestamp.$lte = endDate;
  }
  
  const result = await this.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

// Static method - get total credits for wallet
walletLedgerSchema.statics.getTotalCredits = async function(walletId, startDate, endDate) {
  const match = { walletId: new mongoose.Types.ObjectId(walletId), direction: 'CREDIT' };
  
  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = startDate;
    if (endDate) match.timestamp.$lte = endDate;
  }
  
  const result = await this.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

// Static method - create ledger entry
walletLedgerSchema.statics.createEntry = async function(data) {
  return this.create({
    walletId: data.walletId,
    sessionId: data.sessionId || null,
    direction: data.direction,
    amount: data.amount,
    reason: data.reason,
    balanceAfter: data.balanceAfter,
    metadata: data.metadata || {}
  });
};

const WalletLedger = mongoose.model('WalletLedger', walletLedgerSchema);

export default WalletLedger;


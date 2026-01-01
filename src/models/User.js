import mongoose from 'mongoose';

/**
 * UserAccount Schema
 */
const userAccountSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Full name cannot be more than 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      unique: true,
      trim: true,
      match: [
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
        'Please provide a valid phone number'
      ]
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      default: null
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'BLOCKED'],
        message: 'Status must be either ACTIVE or BLOCKED'
      },
      default: 'ACTIVE'
    },
    kycLevel: {
      type: String,
      enum: {
        values: ['BASIC', 'VERIFIED'],
        message: 'KYC Level must be either BASIC or VERIFIED'
      },
      default: 'BASIC'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
userAccountSchema.index({ email: 1 });
userAccountSchema.index({ phone: 1 });
userAccountSchema.index({ walletId: 1 });

// Instance method - get public profile
userAccountSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    walletId: this.walletId,
    status: this.status,
    kycLevel: this.kycLevel,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method - find by email
userAccountSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method - find by phone
userAccountSchema.statics.findByPhone = function(phone) {
  return this.findOne({ phone });
};

// Instance method - check if account is active
userAccountSchema.methods.isAccountActive = function() {
  return this.status === 'ACTIVE';
};

// Instance method - check if KYC is verified
userAccountSchema.methods.isKycVerified = function() {
  return this.kycLevel === 'VERIFIED';
};

const UserAccount = mongoose.model('UserAccount', userAccountSchema);

export default UserAccount;


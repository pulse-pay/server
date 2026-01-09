import mongoose from 'mongoose';

/**
 * StoreAccount Schema
 */
const storeAccountSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: [true, 'Please provide store name'],
      trim: true,
      maxlength: [100, 'Store name cannot be more than 100 characters']
    },
    ownerName: {
      type: String,
      required: [true, 'Please provide owner name'],
      trim: true,
      maxlength: [100, 'Owner name cannot be more than 100 characters']
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
    storeType: {
      type: String,
      required: [true, 'Please provide store type'],
      enum: {
        values: ['GYM', 'EV', 'WIFI', 'PARKING'],
        message: 'Store type must be GYM, EV, WIFI, or PARKING'
      }
    },
    location: {
      address: {
        type: String,
        required: [true, 'Please provide store address'],
        trim: true
      },
      lat: {
        type: Number,
        required: [true, 'Please provide latitude']
      },
      lng: {
        type: Number,
        required: [true, 'Please provide longitude']
      }
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ['PENDING', 'VERIFIED', 'REJECTED'],
        message: 'Verification status must be PENDING, VERIFIED, or REJECTED'
      },
      default: 'PENDING'
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
storeAccountSchema.index({ walletId: 1 });
storeAccountSchema.index({ storeType: 1 });
storeAccountSchema.index({ verificationStatus: 1 });
storeAccountSchema.index({ 'location.lat': 1, 'location.lng': 1 });

// Instance method - get public profile
storeAccountSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    storeName: this.storeName,
    ownerName: this.ownerName,
    email: this.email,
    phone: this.phone,
    walletId: this.walletId,
    storeType: this.storeType,
    location: this.location,
    verificationStatus: this.verificationStatus,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method - find by email
storeAccountSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method - find by store type
storeAccountSchema.statics.findByStoreType = function (storeType) {
  return this.find({ storeType, isActive: true, verificationStatus: 'VERIFIED' });
};

// Instance method - check if store is verified
storeAccountSchema.methods.isVerified = function () {
  return this.verificationStatus === 'VERIFIED';
};

// Instance method - check if store can accept payments
storeAccountSchema.methods.canAcceptPayments = function () {
  return this.isActive && this.verificationStatus === 'VERIFIED' && this.walletId;
};

// Instance method - check credentials (TODO: Use bcrypt.compare in production)
storeAccountSchema.methods.checkCredentials = function (password) {
  return this.passwordHash === password;
};

const StoreAccount = mongoose.model('StoreAccount', storeAccountSchema);

export default StoreAccount;


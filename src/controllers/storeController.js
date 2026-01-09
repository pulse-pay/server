import StoreAccount from '../models/StoreAccount.js';
import Wallet from '../models/Wallet.js';

/**
 * @desc    Get all store accounts
 * @route   GET /api/stores
 * @access  Public
 */
export const getAllStores = async (req, res, next) => {
  try {
    const { storeType, verificationStatus } = req.query;
    const filter = {};
    
    if (storeType) filter.storeType = storeType;
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    
    const stores = await StoreAccount.find(filter)
      .select('-passwordHash')
      .populate('walletId', 'balance currency status');
    
    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single store account
 * @route   GET /api/stores/:id
 * @access  Public
 */
export const getStoreById = async (req, res, next) => {
  try {
    const store = await StoreAccount.findById(req.params.id)
      .select('-passwordHash')
      .populate('walletId', 'balance currency status');

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store account not found'
      });
    }

    res.status(200).json({
      success: true,
      data: store
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Store account not found'
      });
    }
    next(error);
  }
};

/**
 * @desc    POST store login
 * @route   POST /api/stores/login
 * @access  Public
 */
export const loginStore = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for store (include passwordHash for credential check)
    const store = await StoreAccount.findOne({ email }).select('+passwordHash');

    if (!store) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches using model method
    if (!store.checkCredentials(password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: store.getPublicProfile()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new store account
 * @route   POST /api/stores
 * @access  Public
 */
export const createStore = async (req, res, next) => {
  try {
    const { storeName, ownerName, email, phone, password, storeType, location } = req.body;
    
    // Check if store already exists by email
    const existingStoreByEmail = await StoreAccount.findByEmail(email);
    if (existingStoreByEmail) {
      return res.status(400).json({
        success: false,
        message: 'Store with this email already exists'
      });
    }
    
    // Create store account
    const store = await StoreAccount.create({
      storeName,
      ownerName,
      email,
      phone,
      passwordHash: password, // TODO: Hash with bcrypt in production
      storeType,
      location,
      verificationStatus: 'PENDING',
      isActive: true
    });
    
    // Create wallet for store
    const wallet = await Wallet.create({
      ownerType: 'STORE',
      ownerId: store._id,
      balance: 0,
      currency: 'INR',
      status: 'ACTIVE'
    });
    
    // Link wallet to store
    store.walletId = wallet._id;
    await store.save();
    
    res.status(201).json({
      success: true,
      message: 'Store account created successfully',
      data: store.getPublicProfile()
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    next(error);
  }
};

/**
 * @desc    Update store account
 * @route   PUT /api/stores/:id
 * @access  Public
 */
export const updateStore = async (req, res, next) => {
  try {
    const { storeName, ownerName, email, phone, storeType, location, isActive } = req.body;
    
    const updateData = {};
    if (storeName) updateData.storeName = storeName;
    if (ownerName) updateData.ownerName = ownerName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (storeType) updateData.storeType = storeType;
    if (location) updateData.location = location;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    
    const store = await StoreAccount.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store account not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Store account updated successfully',
      data: store
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Store account not found'
      });
    }
    next(error);
  }
};

/**
 * @desc    Verify store account
 * @route   PUT /api/stores/:id/verify
 * @access  Admin
 */
export const verifyStore = async (req, res, next) => {
  try {
    const { verificationStatus } = req.body;
    
    if (!['VERIFIED', 'REJECTED'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status'
      });
    }
    
    const store = await StoreAccount.findByIdAndUpdate(
      req.params.id,
      { verificationStatus },
      { new: true }
    ).select('-passwordHash');
    
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store account not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Store ${verificationStatus.toLowerCase()} successfully`,
      data: store
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete store account
 * @route   DELETE /api/stores/:id
 * @access  Public
 */
export const deleteStore = async (req, res, next) => {
  try {
    const store = await StoreAccount.findByIdAndDelete(req.params.id);
    
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store account not found'
      });
    }
    
    // Also delete store's wallet
    if (store.walletId) {
      await Wallet.findByIdAndDelete(store.walletId);
    }
    
    res.status(200).json({
      success: true,
      message: 'Store account deleted successfully',
      data: {}
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Store account not found'
      });
    }
    next(error);
  }
};

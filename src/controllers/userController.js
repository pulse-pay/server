import UserAccount from '../models/User.js';
import Wallet from '../models/Wallet.js';

/**
 * @desc    Get all user accounts
 * @route   GET /api/users
 * @access  Public
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await UserAccount.find()
      .select('-passwordHash')
      .populate('walletId', 'balance currency status');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user account by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await UserAccount.findById(req.params.id)
      .select('-passwordHash')
      .populate('walletId', 'balance currency status');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }
    next(error);
  }
};

/**
 * @desc    Create new user account
 * @route   POST /api/users
 * @access  Public
 */
export const createUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;
    
    // Check if user already exists by email
    const existingUserByEmail = await UserAccount.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Check if user already exists by phone
    const existingUserByPhone = await UserAccount.findByPhone(phone);
    if (existingUserByPhone) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }
    
    // Create user account
    const user = await UserAccount.create({
      fullName,
      email,
      phone,
      passwordHash: password, // TODO: Hash with bcrypt in production
      status: 'ACTIVE',
      kycLevel: 'BASIC'
    });
    
    // Create wallet for user
    const wallet = await Wallet.create({
      ownerType: 'USER',
      ownerId: user._id,
      balance: 0,
      currency: 'INR',
      status: 'ACTIVE'
    });
    
    // Link wallet to user
    user.walletId = wallet._id;
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'User account created successfully',
      data: user.getPublicProfile()
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
 * @desc    Update user account
 * @route   PUT /api/users/:id
 * @access  Public
 */
export const updateUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, status, kycLevel } = req.body;
    
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (status) updateData.status = status;
    if (kycLevel) updateData.kycLevel = kycLevel;
    
    const user = await UserAccount.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User account updated successfully',
      data: user
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/:id
 * @access  Public
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await UserAccount.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }
    
    // Also delete user's wallet
    if (user.walletId) {
      await Wallet.findByIdAndDelete(user.walletId);
    }
    
    res.status(200).json({
      success: true,
      message: 'User account deleted successfully',
      data: {}
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }
    next(error);
  }
};

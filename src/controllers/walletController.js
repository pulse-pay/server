import Wallet from '../models/Wallet.js';
import WalletLedger from '../models/WalletLedger.js';

/**
 * @desc    Get wallet by ID
 * @route   GET /api/wallets/:id
 * @access  Public
 */
export const getWalletById = async (req, res, next) => {
  try {
    const wallet = await Wallet.findById(req.params.id)
      .populate('activeSessionId');
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: wallet
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    next(error);
  }
};

/**
 * @desc    Get wallet balance
 * @route   GET /api/wallets/:id/balance
 * @access  Public
 */
export const getWalletBalance = async (req, res, next) => {
  try {
    const wallet = await Wallet.findById(req.params.id);
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        balance: wallet.balance,
        lockedBalance: wallet.lockedBalance,
        availableBalance: wallet.availableBalance,
        currency: wallet.currency
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Top up wallet
 * @route   POST /api/wallets/:id/topup
 * @access  Public
 */
export const topUpWallet = async (req, res, next) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }
    
    const wallet = await Wallet.findById(req.params.id);
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    if (!wallet.isWalletActive()) {
      return res.status(400).json({
        success: false,
        message: 'Wallet is suspended'
      });
    }
    
    // Credit the wallet
    wallet.balance += amount;
    await wallet.save();
    
    // Create ledger entry
    await WalletLedger.createEntry({
      walletId: wallet._id,
      direction: 'CREDIT',
      amount,
      reason: 'WALLET_TOPUP',
      balanceAfter: wallet.balance
    });
    
    res.status(200).json({
      success: true,
      message: 'Wallet topped up successfully',
      data: {
        balance: wallet.balance,
        currency: wallet.currency
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Withdraw from wallet
 * @route   POST /api/wallets/:id/withdraw
 * @access  Public
 */
export const withdrawFromWallet = async (req, res, next) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }
    
    const wallet = await Wallet.findById(req.params.id);
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    if (!wallet.isWalletActive()) {
      return res.status(400).json({
        success: false,
        message: 'Wallet is suspended'
      });
    }
    
    if (!wallet.hasSufficientBalance(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }
    
    // Debit the wallet
    wallet.balance -= amount;
    await wallet.save();
    
    // Create ledger entry
    await WalletLedger.createEntry({
      walletId: wallet._id,
      direction: 'DEBIT',
      amount,
      reason: 'WALLET_WITHDRAWAL',
      balanceAfter: wallet.balance
    });
    
    res.status(200).json({
      success: true,
      message: 'Withdrawal successful',
      data: {
        balance: wallet.balance,
        currency: wallet.currency
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get wallet transaction history
 * @route   GET /api/wallets/:id/transactions
 * @access  Public
 */
export const getWalletTransactions = async (req, res, next) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    
    const wallet = await Wallet.findById(req.params.id);
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    const transactions = await WalletLedger.findByWallet(wallet._id, {
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
    
    const totalCount = await WalletLedger.countDocuments({ walletId: wallet._id });
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      total: totalCount,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Suspend wallet
 * @route   PUT /api/wallets/:id/suspend
 * @access  Admin
 */
export const suspendWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findByIdAndUpdate(
      req.params.id,
      { status: 'SUSPENDED' },
      { new: true }
    );
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Wallet suspended successfully',
      data: wallet
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Activate wallet
 * @route   PUT /api/wallets/:id/activate
 * @access  Admin
 */
export const activateWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findByIdAndUpdate(
      req.params.id,
      { status: 'ACTIVE' },
      { new: true }
    );
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Wallet activated successfully',
      data: wallet
    });
  } catch (error) {
    next(error);
  }
};


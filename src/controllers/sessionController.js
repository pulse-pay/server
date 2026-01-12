import StreamSession from '../models/StreamSession.js';
import Service from '../models/Service.js';
import Wallet from '../models/Wallet.js';
import WalletLedger from '../models/WalletLedger.js';
import UserAccount from '../models/User.js';
import { createFlow, stopFlow, getFlowInfo, DEFAULT_SUPER_TOKEN } from '../services/superfluid.js';
import { ethers } from 'ethers';

/**
 * @desc    Start a new streaming session
 * @route   POST /api/sessions/start
 * @access  User
 */
export const startSession = async (req, res, next) => {
  try {
    const { userWalletId, serviceId, storeId, evmAddress, userId } = req.body;

    let targetWalletId = userWalletId;

    // If no ID but address provided, look up wallet
    if (!targetWalletId && evmAddress) {
      const walletByAddr = await Wallet.findOne({ evmAddress: evmAddress.trim() }).select('+encryptedPrivateKey');
      if (walletByAddr) {
        targetWalletId = walletByAddr._id;
      } else {
        return res.status(404).json({
          success: false,
          message: 'No wallet found for this address. Please register first.'
        });
      }
    }

    // Get user wallet
    const userWallet = await Wallet.findById(targetWalletId).select('+encryptedPrivateKey');
    if (!userWallet) {
      return res.status(404).json({
        success: false,
        message: 'User wallet not found'
      });
    }

    if (!userWallet.isWalletActive()) {
      return res.status(400).json({
        success: false,
        message: 'User wallet is suspended'
      });
    }

    // Check if user already has an active session
    if (userWallet.hasActiveSession()) {
      return res.status(400).json({
        success: false,
        message: 'User already has an active session'
      });
    }

    // Get service
    const service = await Service.findById(serviceId).populate('storeId');
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (!service.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Service is not active'
      });
    }

    // Check if user has minimum balance
    if (!service.canUserAfford(userWallet.availableBalance)) {
      return res.status(400).json({
        success: false,
        message: `Minimum balance of ${service.minBalanceRequired} required`
      });
    }

    // Get store wallet
    const storeWallet = await Wallet.findById(service.storeId.walletId);
    if (!storeWallet || !storeWallet.isWalletActive()) {
      return res.status(400).json({
        success: false,
        message: 'Store wallet is not available'
      });
    }

    // Create session
    const effectiveRatePerSecond = service.ratePerMinute ? (service.ratePerMinute / 60) : service.ratePerSecond;

    const session = await StreamSession.create({
      userWalletId: userWallet._id,
      storeWalletId: storeWallet._id,
      serviceId,
      ratePerSecond: effectiveRatePerSecond,
      startedAt: new Date(),
      lastBilledAt: new Date(),
      totalAmountTransferred: 0,
      totalDurationSeconds: 0
    });

    // Try to create Superfluid Flow (if wallet is crypto-enabled)
    if (userWallet.encryptedPrivateKey && storeWallet.evmAddress) {
      try {
        const ratePerMinWei = ethers.utils.parseEther(service.ratePerMinute.toString());
        const flowRateWei = ratePerMinWei.div(60);

        console.log(`Starting Superfluid flow: ${flowRateWei.toString()} wei/sec (${service.ratePerMinute} tokens/min)`);

        const flowResult = await createFlow(
          userWallet.encryptedPrivateKey,
          storeWallet.evmAddress,
          flowRateWei.toString()
        );

        session.onChainFlowId = flowResult.flowIds;
        session.superTokenAddress = DEFAULT_SUPER_TOKEN;
      } catch (sfError) {
        console.error('Superfluid creation failed:', sfError);
        await StreamSession.deleteOne({ _id: session._id });
        return res.status(500).json({
          success: false,
          message: 'Failed to create crypto stream: ' + sfError.message
        });
      }
    } else {
      console.warn('Crypto keys missing, falling back to database ledger only.');
    }

    // Update user wallet with active session
    userWallet.activeSessionId = session._id;
    await userWallet.save();

    // Add storeId to user's storeIds array
    // Use userId from request body (avoids extra DB lookup)
    // Fallback to wallet.ownerId if userId not provided
    if (storeId) {
      const targetUserId = userId || userWallet.ownerId;
      if (targetUserId && userWallet.ownerType === 'USER') {
        await UserAccount.updateOne(
          { _id: targetUserId },
          { $addToSet: { storeIds: storeId } }
        );
      }
    }

    await session.populate([
      { path: 'serviceId', select: 'name ratePerSecond' },
      { path: 'userWalletId', select: 'balance' },
      { path: 'storeWalletId', select: 'balance' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Session started successfully',
      data: session
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    End a streaming session
 * @route   POST /api/sessions/:id/end
 * @access  User
 */
export const endSession = async (req, res, next) => {
  try {
    const session = await StreamSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.status === 'ENDED') {
      return res.status(400).json({
        success: false,
        message: 'Session is already ended'
      });
    }

    // Calculate final billing
    const now = new Date();
    const lastBilled = new Date(session.lastBilledAt);
    const unbilledSeconds = Math.floor((now - lastBilled) / 1000);
    const unbilledAmount = unbilledSeconds * session.ratePerSecond;

    // Get wallets
    const userWallet = await Wallet.findById(session.userWalletId);
    const storeWallet = await Wallet.findById(session.storeWalletId);
    const service = await Service.findById(session.serviceId).populate('storeId');

    // Process final payment if there's unbilled amount
    if (unbilledAmount > 0 && userWallet.hasSufficientBalance(unbilledAmount)) {
      // Debit user
      userWallet.balance -= unbilledAmount;
      storeWallet.balance += unbilledAmount;
      await storeWallet.save();

      // Stop Superfluid Flow (if active)
      if (session.onChainFlowId && userWallet.encryptedPrivateKey && storeWallet.evmAddress) {
        try {
          await stopFlow(
            userWallet.encryptedPrivateKey,
            storeWallet.evmAddress
          );
        } catch (sfError) {
          console.error('Superfluid stop failed:', sfError);
          // We continue to end the session locally even if chain fails (avoid zombie session in UI)
        }
      }

      // Determine reason based on store type
      const reasonMap = {
        'GYM': 'GYM_STREAM',
        'EV': 'EV_STREAM',
        'WIFI': 'WIFI_STREAM',
        'PARKING': 'PARKING_STREAM'
      };
      const reason = reasonMap[service.storeId.storeType] || 'GYM_STREAM';

      // Create ledger entries
      await WalletLedger.createEntry({
        walletId: userWallet._id,
        sessionId: session._id,
        direction: 'DEBIT',
        amount: unbilledAmount,
        reason,
        balanceAfter: userWallet.balance
      });

      await WalletLedger.createEntry({
        walletId: storeWallet._id,
        sessionId: session._id,
        direction: 'CREDIT',
        amount: unbilledAmount,
        reason,
        balanceAfter: storeWallet.balance
      });

      // Update session totals
      session.totalAmountTransferred += unbilledAmount;
      session.totalDurationSeconds += unbilledSeconds;
    }

    // End session
    session.status = 'ENDED';
    session.endedAt = now;
    session.lastBilledAt = now;
    await session.save();

    // Clear active session from user wallet
    userWallet.activeSessionId = null;
    await userWallet.save();

    res.status(200).json({
      success: true,
      message: 'Session ended successfully',
      data: {
        sessionId: session._id,
        totalDurationSeconds: session.totalDurationSeconds,
        totalAmountTransferred: session.totalAmountTransferred,
        endedAt: session.endedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get session by ID
 * @route   GET /api/sessions/:id
 * @access  Public
 */
export const getSessionById = async (req, res, next) => {
  try {
    const session = await StreamSession.findById(req.params.id)
      .populate('serviceId', 'name ratePerSecond')
      .populate('userWalletId', 'balance ownerId')
      .populate('storeWalletId', 'balance ownerId');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    next(error);
  }
};

/**
 * @desc    Get active session for user wallet
 * @route   GET /api/sessions/active/:walletId
 * @access  Public
 */
export const getActiveSession = async (req, res, next) => {
  try {
    const session = await StreamSession.findActiveByUserWallet(req.params.walletId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active session found'
      });
    }

    await session.populate([
      { path: 'serviceId', select: 'name ratePerSecond' },
      { path: 'storeWalletId', select: 'ownerId' }
    ]);

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Process billing for active session (called periodically)
 * @route   POST /api/sessions/:id/bill
 * @access  System
 */
export const processSessionBilling = async (req, res, next) => {
  try {
    const session = await StreamSession.findById(req.params.id);

    if (!session || session.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'No active session to bill'
      });
    }

    // Calculate unbilled amount
    const now = new Date();
    const lastBilled = new Date(session.lastBilledAt);
    const unbilledSeconds = Math.floor((now - lastBilled) / 1000);
    const unbilledAmount = unbilledSeconds * session.ratePerSecond;

    if (unbilledAmount <= 0) {
      return res.status(200).json({
        success: true,
        message: 'Nothing to bill',
        data: { amount: 0 }
      });
    }

    // Get wallets
    const userWallet = await Wallet.findById(session.userWalletId);
    const storeWallet = await Wallet.findById(session.storeWalletId);
    const service = await Service.findById(session.serviceId).populate('storeId');

    // Check if user has sufficient balance
    if (!userWallet.hasSufficientBalance(unbilledAmount)) {
      // End session due to insufficient balance
      session.status = 'ENDED';
      session.endedAt = now;
      await session.save();

      userWallet.activeSessionId = null;
      await userWallet.save();

      return res.status(400).json({
        success: false,
        message: 'Session ended due to insufficient balance',
        data: {
          sessionEnded: true,
          totalAmountTransferred: session.totalAmountTransferred,
          totalDurationSeconds: session.totalDurationSeconds
        }
      });
    }

    // Process payment
    userWallet.balance -= unbilledAmount;
    await userWallet.save();

    storeWallet.balance += unbilledAmount;
    await storeWallet.save();

    // Determine reason based on store type
    const reasonMap = {
      'GYM': 'GYM_STREAM',
      'EV': 'EV_STREAM',
      'WIFI': 'WIFI_STREAM',
      'PARKING': 'PARKING_STREAM'
    };
    const reason = reasonMap[service.storeId.storeType] || 'GYM_STREAM';

    // Create ledger entries
    await WalletLedger.createEntry({
      walletId: userWallet._id,
      sessionId: session._id,
      direction: 'DEBIT',
      amount: unbilledAmount,
      reason,
      balanceAfter: userWallet.balance
    });

    await WalletLedger.createEntry({
      walletId: storeWallet._id,
      sessionId: session._id,
      direction: 'CREDIT',
      amount: unbilledAmount,
      reason,
      balanceAfter: storeWallet.balance
    });

    // Update session
    session.totalAmountTransferred += unbilledAmount;
    session.totalDurationSeconds += unbilledSeconds;
    session.lastBilledAt = now;
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Billing processed successfully',
      data: {
        billedAmount: unbilledAmount,
        billedSeconds: unbilledSeconds,
        totalAmountTransferred: session.totalAmountTransferred,
        totalDurationSeconds: session.totalDurationSeconds,
        userBalance: userWallet.balance
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get session history for user
 * @route   GET /api/sessions/history/:walletId
 * @access  Public
 */
export const getSessionHistory = async (req, res, next) => {
  try {
    const { limit = 20, skip = 0 } = req.query;

    const sessions = await StreamSession.find({ userWalletId: req.params.walletId })
      .populate('serviceId', 'name')
      .sort({ startedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await StreamSession.countDocuments({ userWalletId: req.params.walletId });

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Sync session status with blockchain
 * @route   POST /api/sessions/:id/sync
 * @access  System
 */
export const syncSessionStatus = async (req, res, next) => {
  try {
    const session = await StreamSession.findById(req.params.id);

    if (!session || !session.onChainFlowId) {
      return res.status(400).json({ success: false, message: 'Not a crypto session' });
    }

    // Get wallets
    const userWallet = await Wallet.findById(session.userWalletId);
    const storeWallet = await Wallet.findById(session.storeWalletId);

    if (!userWallet.evmAddress || !storeWallet.evmAddress) {
      return res.status(400).json({ success: false, message: 'Wallet addresses missing' });
    }

    const flowInfo = await getFlowInfo(userWallet.evmAddress, storeWallet.evmAddress);

    // Check if flow rate is 0 (stopped)
    if (flowInfo.flowRate === '0') {
      if (session.status === 'ACTIVE') {
        console.log('Flow stopped on-chain, revoking access...');
        // Logic to end session
        session.status = 'ENDED';
        session.endedAt = new Date();
        await session.save();

        // Update active session on wallet
        userWallet.activeSessionId = null;
        await userWallet.save();

        return res.status(200).json({
          success: true,
          message: 'Session synced: Access revoked (Flow stopped)',
          data: { status: 'ENDED' }
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Session synced: Flow active',
      data: { flowRate: flowInfo.flowRate }
    });

  } catch (error) {
    next(error);
  }
};


import express from 'express';
import {
  getWalletById,
  getWalletBalance,
  topUpWallet,
  withdrawFromWallet,
  getWalletTransactions,
  suspendWallet,
  activateWallet
} from '../controllers/walletController.js';

const router = express.Router();

// Route: /api/wallets/:id
router.get('/:id', getWalletById);

// Route: /api/wallets/:id/balance
router.get('/:id/balance', getWalletBalance);

// Route: /api/wallets/:id/topup
router.post('/:id/topup', topUpWallet);

// Route: /api/wallets/:id/withdraw
router.post('/:id/withdraw', withdrawFromWallet);

// Route: /api/wallets/:id/transactions
router.get('/:id/transactions', getWalletTransactions);

// Route: /api/wallets/:id/suspend
router.put('/:id/suspend', suspendWallet);

// Route: /api/wallets/:id/activate
router.put('/:id/activate', activateWallet);

export default router;


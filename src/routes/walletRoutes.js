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

/**
 * @swagger
 * /wallets/{id}:
 *   get:
 *     summary: Get wallet by ID
 *     tags: [Wallets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Wallet details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 */
router.get('/:id', getWalletById);

// Route: /api/wallets/:id/balance
router.get('/:id/balance', getWalletBalance);

/**
 * @swagger
 * /wallets/{id}/topup:
 *   post:
 *     summary: Top up wallet balance
 *     tags: [Wallets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Wallet topped up
 */
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


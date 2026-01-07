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
 * tags:
 *   name: Wallets
 *   description: Wallet balances, funding, and lifecycle
 */

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
 *       404:
 *         description: Wallet not found
 */
router.get('/:id', getWalletById);

/**
 * @swagger
 * /wallets/{id}/balance:
 *   get:
 *     summary: Get wallet balances
 *     tags: [Wallets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Balance info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                     lockedBalance:
 *                       type: number
 *                     availableBalance:
 *                       type: number
 *                     currency:
 *                       type: string
 *       404:
 *         description: Wallet not found
 */
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
 *             required: [amount]
 *     responses:
 *       200:
 *         description: Wallet topped up
 *       400:
 *         description: Invalid amount or wallet suspended
 *       404:
 *         description: Wallet not found
 */
router.post('/:id/topup', topUpWallet);

/**
 * @swagger
 * /wallets/{id}/withdraw:
 *   post:
 *     summary: Withdraw from a wallet
 *     tags: [Wallets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Withdrawal successful
 *       400:
 *         description: Invalid amount or insufficient balance
 *       404:
 *         description: Wallet not found
 */
router.post('/:id/withdraw', withdrawFromWallet);

/**
 * @swagger
 * /wallets/{id}/transactions:
 *   get:
 *     summary: Get wallet transaction history
 *     tags: [Wallets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return (default 50)
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Records to skip
 *     responses:
 *       200:
 *         description: Ledger entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WalletLedger'
 *       404:
 *         description: Wallet not found
 */
router.get('/:id/transactions', getWalletTransactions);

/**
 * @swagger
 * /wallets/{id}/suspend:
 *   put:
 *     summary: Suspend a wallet
 *     tags: [Wallets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wallet suspended
 *       404:
 *         description: Wallet not found
 */
router.put('/:id/suspend', suspendWallet);

/**
 * @swagger
 * /wallets/{id}/activate:
 *   put:
 *     summary: Activate a wallet
 *     tags: [Wallets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wallet activated
 *       404:
 *         description: Wallet not found
 */
router.put('/:id/activate', activateWallet);

export default router;


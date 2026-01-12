import express from 'express';
import {
  startSession,
  endSession,
  getSessionById,
  getActiveSession,
  processSessionBilling,
  getSessionHistory,
  syncSessionStatus
} from '../controllers/sessionController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Manage real-time streaming sessions and billing
 */

/**
 * @swagger
 * /sessions/start:
 *   post:
 *     summary: Start a streaming session
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serviceId]
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID (optional - pass to avoid extra DB lookup, falls back to wallet.ownerId)
 *               userWalletId:
 *                 type: string
 *                 description: Wallet initiating the stream
 *               serviceId:
 *                 type: string
 *                 description: Service ID to stream
 *               storeId:
 *                 type: string
 *                 description: Store ID to add to user's storeIds array
 *               evmAddress:
 *                 type: string
 *                 description: Optional EVM address to look up the wallet (if userWalletId not provided)
 *           example:
 *             userId: "64a1b2c3d4e5f6789..."
 *             userWalletId: "64a1b2c3d4e5f6789..."
 *             serviceId: "64a1b2c3d4e5f6789..."
 *             storeId: "64a1b2c3d4e5f6789..."
 *     responses:
 *       201:
 *         description: Session started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/StreamSession'
 *       400:
 *         description: Validation failed, insufficient balance, or user already has active session
 *       404:
 *         description: Wallet or service not found
 */
router.post('/start', startSession);

/**
 * @swagger
 * /sessions/active/{walletId}:
 *   get:
 *     summary: Get the active session for a wallet
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: User wallet ID
 *     responses:
 *       200:
 *         description: Active session found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StreamSession'
 *       404:
 *         description: No active session
 */
router.get('/active/:walletId', getActiveSession);

/**
 * @swagger
 * /sessions/history/{walletId}:
 *   get:
 *     summary: Get session history for a wallet
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Records to skip for pagination
 *     responses:
 *       200:
 *         description: Paged history of sessions
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
 *                     $ref: '#/components/schemas/StreamSession'
 */
router.get('/history/:walletId', getSessionHistory);

/**
 * @swagger
 * /sessions/{id}:
 *   get:
 *     summary: Get session by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StreamSession'
 *       404:
 *         description: Session not found
 */
router.get('/:id', getSessionById);

/**
 * @swagger
 * /sessions/{id}/end:
 *   post:
 *     summary: End a streaming session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The session ID
 *     responses:
 *       200:
 *         description: Session ended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                     totalDurationSeconds:
 *                       type: number
 *                     totalAmountTransferred:
 *                       type: number
 *                     endedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Session not found
 *       400:
 *         description: Session is already ended
 */
router.post('/:id/end', endSession);

/**
 * @swagger
 * /sessions/{id}/bill:
 *   post:
 *     summary: Process billing for an active session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Billing processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: booleanactive
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     billedAmount:
 *                       type: number
 *                     billedSeconds:
 *                       type: number
 *                     totalAmountTransferred:
 *                       type: number
 *                     totalDurationSeconds:
 *                       type: number
 *                     userBalance:
 *                       type: number
 *       400:
 *         description: No active session to bill or insufficient balance
 */
router.post('/:id/bill', processSessionBilling);

/**
 * @swagger
 * /sessions/{id}/sync:
 *   post:
 *     summary: Sync session status with blockchain
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The session ID
 *     responses:
 *       200:
 *         description: Session status synced
 *       400:
 *         description: Not a crypto session or wallet addresses missing
 */
router.post('/:id/sync', syncSessionStatus);

export default router;


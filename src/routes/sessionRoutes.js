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
 *               userWalletId:
 *                 type: string
 *                 description: Wallet initiating the stream
 *               serviceId:
 *                 type: string
 *               evmAddress:
 *                 type: string
 *                 description: Optional EVM address to look up the wallet
 *     responses:
 *       201:
 *         description: Session started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StreamSession'
 *       400:
 *         description: Validation failed or insufficient balance
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
 *         description: Number of records to return (default 20)
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
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
 *       404:
 *         description: Session not found
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


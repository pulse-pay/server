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
 *             required:
 *               - userWalletId
 *               - serviceId
 *             properties:
 *               userWalletId:
 *                 type: string
 *               serviceId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StreamSession'
 *       400:
 *         description: Bad request (insufficient balance, etc.)
 */
router.post('/start', startSession);

// Route: /api/sessions/active/:walletId
router.get('/active/:walletId', getActiveSession);

// Route: /api/sessions/history/:walletId
router.get('/history/:walletId', getSessionHistory);

// Route: /api/sessions/:id
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
 */
router.post('/:id/end', endSession);

// Route: /api/sessions/:id/bill
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
 */
router.post('/:id/sync', syncSessionStatus);

export default router;


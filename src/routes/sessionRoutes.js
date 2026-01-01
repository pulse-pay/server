import express from 'express';
import {
  startSession,
  endSession,
  getSessionById,
  getActiveSession,
  processSessionBilling,
  getSessionHistory
} from '../controllers/sessionController.js';

const router = express.Router();

// Route: /api/sessions/start
router.post('/start', startSession);

// Route: /api/sessions/active/:walletId
router.get('/active/:walletId', getActiveSession);

// Route: /api/sessions/history/:walletId
router.get('/history/:walletId', getSessionHistory);

// Route: /api/sessions/:id
router.get('/:id', getSessionById);

// Route: /api/sessions/:id/end
router.post('/:id/end', endSession);

// Route: /api/sessions/:id/bill
router.post('/:id/bill', processSessionBilling);

export default router;


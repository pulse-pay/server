import express from 'express';
import {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  verifyStore,
  deleteStore
} from '../controllers/storeController.js';
import { getServicesByStore } from '../controllers/serviceController.js';

const router = express.Router();

// Route: /api/stores
router.route('/')
  .get(getAllStores)
  .post(createStore);

// Route: /api/stores/:id
router.route('/:id')
  .get(getStoreById)
  .put(updateStore)
  .delete(deleteStore);

// Route: /api/stores/:id/verify
router.put('/:id/verify', verifyStore);

// Route: /api/stores/:storeId/services
router.get('/:storeId/services', getServicesByStore);

export default router;


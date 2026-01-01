import express from 'express';
import {
  getAllServices,
  getServiceById,
  getServiceByQrCode,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';

const router = express.Router();

// Route: /api/services
router.route('/')
  .get(getAllServices)
  .post(createService);

// Route: /api/services/qr/:qrCodeId
router.get('/qr/:qrCodeId', getServiceByQrCode);

// Route: /api/services/:id
router.route('/:id')
  .get(getServiceById)
  .put(updateService)
  .delete(deleteService);

export default router;


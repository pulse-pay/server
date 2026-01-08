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

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Manage billable services offered by stores
 */

/**
 * @swagger
 * /services:
 *   get:
 *     summary: List services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: string
 *         description: Filter by store ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Services fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Service'
 *   post:
 *     summary: Create a service
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [storeId, name, ratePerMinute, minBalanceRequired]
 *             properties:
 *               storeId:
 *                 type: string
 *               name:
 *                 type: string
 *               ratePerSecond:
 *                 type: number
 *               ratePerMinute:
 *                 type: number
 *               minBalanceRequired:
 *                 type: number
 *     responses:
 *       201:
 *         description: Service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 */
router.route('/')
  .get(getAllServices)
  .post(createService);

/**
 * @swagger
 * /services/qr/{qrCodeId}:
 *   get:
 *     summary: Get service by QR code
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: qrCodeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 */
router.get('/qr/:qrCodeId', getServiceByQrCode);

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 *   put:
 *     summary: Update a service
 *     tags: [Services]
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
 *             properties:
 *               name:
 *                 type: string
 *               ratePerSecond:
 *                 type: number
 *               ratePerMinute:
 *                 type: number
 *               minBalanceRequired:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Service updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 *   delete:
 *     summary: Delete a service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service deleted
 *       404:
 *         description: Service not found
 */
router.route('/:id')
  .get(getServiceById)
  .put(updateService)
  .delete(deleteService);

export default router;


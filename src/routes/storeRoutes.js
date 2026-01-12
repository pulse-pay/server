import express from 'express';
import {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  verifyStore,
  deleteStore,
  loginStore,
  getAllClientsByStoreId
} from '../controllers/storeController.js';
import { getServicesByStore } from '../controllers/serviceController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Stores
 *   description: Manage store accounts and verification
 */

/**
 * @swagger
 * /stores:
 *   get:
 *     summary: List stores
 *     tags: [Stores]
 *     parameters:
 *       - in: query
 *         name: storeType
 *         schema:
 *           type: string
 *           enum: [GYM, EV, WIFI, PARKING]
 *       - in: query
 *         name: verificationStatus
 *         schema:
 *           type: string
 *           enum: [PENDING, VERIFIED, REJECTED]
 *     responses:
 *       200:
 *         description: Stores fetched
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
 *                     $ref: '#/components/schemas/StoreAccount'
 *   post:
 *     summary: Create a store
 *     tags: [Stores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [storeName, ownerName, email, phone, password, storeType, location]
 *             properties:
 *               storeName:
 *                 type: string
 *               ownerName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               storeType:
 *                 type: string
 *                 enum: [GYM, EV, WIFI, PARKING]
 *               location:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *     responses:
 *       201:
 *         description: Store created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreAccount'
 */
router.route('/')
  .get(getAllStores)
  .post(createStore);

/**
 * @swagger
 * /stores/login:
 *   post:
 *     summary: Store login
 *     tags: [Stores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreAccount'
 */
router.route('/login')
  .post(loginStore);


/**
 * @swagger
 * /stores/{id}:
 *   get:
 *     summary: Get a store by ID
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Store found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreAccount'
 *       404:
 *         description: Store not found
 *   put:
 *     summary: Update a store
 *     tags: [Stores]
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
 *             $ref: '#/components/schemas/StoreAccount'
 *     responses:
 *       200:
 *         description: Store updated
 *       404:
 *         description: Store not found
 *   delete:
 *     summary: Delete a store
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Store deleted
 *       404:
 *         description: Store not found
 */
router.route('/:id')
  .get(getStoreById)
  .put(updateStore)
  .delete(deleteStore);

/**
 * @swagger
 * /stores/{id}/clients:
 *   get:
 *     summary: Get all clients by store ID
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Clients found
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
 *       404:
 *         description: Store not found
 */
router.get('/:id/clients', getAllClientsByStoreId);

/**
 * @swagger
 * /stores/{id}/verify:
 *   put:
 *     summary: Verify or reject a store
 *     tags: [Stores]
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
 *             required: [verificationStatus]
 *             properties:
 *               verificationStatus:
 *                 type: string
 *                 enum: [VERIFIED, REJECTED]
 *     responses:
 *       200:
 *         description: Store verification updated
 *       400:
 *         description: Invalid verification status
 *       404:
 *         description: Store not found
 */
router.put('/:id/verify', verifyStore);

/**
 * @swagger
 * /stores/{storeId}/services:
 *   get:
 *     summary: Get services offered by a store
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Services for the store
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
 */
router.get('/:storeId/services', getServicesByStore);

export default router;


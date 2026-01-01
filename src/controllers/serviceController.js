import Service from '../models/Service.js';
import StoreAccount from '../models/StoreAccount.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @desc    Get all services
 * @route   GET /api/services
 * @access  Public
 */
export const getAllServices = async (req, res, next) => {
  try {
    const { storeId, isActive } = req.query;
    const filter = {};
    
    if (storeId) filter.storeId = storeId;
    if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true';
    
    const services = await Service.find(filter)
      .populate('storeId', 'storeName storeType location');
    
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get service by ID
 * @route   GET /api/services/:id
 * @access  Public
 */
export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('storeId', 'storeName storeType location walletId');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    next(error);
  }
};

/**
 * @desc    Get service by QR code
 * @route   GET /api/services/qr/:qrCodeId
 * @access  Public
 */
export const getServiceByQrCode = async (req, res, next) => {
  try {
    const service = await Service.findByQrCode(req.params.qrCodeId);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    await service.populate('storeId', 'storeName storeType location walletId');
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new service
 * @route   POST /api/services
 * @access  Store Owner
 */
export const createService = async (req, res, next) => {
  try {
    const { storeId, name, ratePerSecond, minBalanceRequired } = req.body;
    
    // Verify store exists and is verified
    const store = await StoreAccount.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }
    
    if (!store.isVerified()) {
      return res.status(400).json({
        success: false,
        message: 'Store must be verified to create services'
      });
    }
    
    // Generate unique QR code ID
    const qrCodeId = `SVC-${uuidv4().split('-')[0].toUpperCase()}`;
    
    const service = await Service.create({
      storeId,
      name,
      ratePerSecond,
      minBalanceRequired,
      qrCodeId,
      isActive: true
    });
    
    await service.populate('storeId', 'storeName storeType');
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    next(error);
  }
};

/**
 * @desc    Update service
 * @route   PUT /api/services/:id
 * @access  Store Owner
 */
export const updateService = async (req, res, next) => {
  try {
    const { name, ratePerSecond, minBalanceRequired, isActive } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (typeof ratePerSecond !== 'undefined') updateData.ratePerSecond = ratePerSecond;
    if (typeof minBalanceRequired !== 'undefined') updateData.minBalanceRequired = minBalanceRequired;
    if (typeof isActive !== 'undefined') updateData.isActive = isActive;
    
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('storeId', 'storeName storeType');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete service
 * @route   DELETE /api/services/:id
 * @access  Store Owner
 */
export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
      data: {}
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    next(error);
  }
};

/**
 * @desc    Get services by store
 * @route   GET /api/stores/:storeId/services
 * @access  Public
 */
export const getServicesByStore = async (req, res, next) => {
  try {
    const services = await Service.findByStore(req.params.storeId);
    
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};


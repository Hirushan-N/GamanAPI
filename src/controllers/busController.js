const Bus = require('../models/Bus');
const User = require('../models/User'); // Assuming User is the operator model
const Joi = require('joi');
const logger = require('../utils/logger');

// Joi validation schemas
const busSchema = Joi.object({
  busNumber: Joi.string().required(),
  capacity: Joi.number().integer().min(1).required(),
  operatorId: Joi.string().required(),
  ownershipType: Joi.string().valid('SLTB', 'PRIVATE').required(),
  status: Joi.string().valid('ACTIVE', 'MAINTENANCE').default('ACTIVE'),
});

exports.searchBuses = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;

    // Build query filters
    const query = {};
    if (filters.busNumber) query.busNumber = new RegExp(`^${filters.busNumber.trim()}$`, 'i');
    if (filters.capacity  && !isNaN(filters.capacity)) query.capacity = parseInt(filters.capacity);
    if (filters.operatorId) query.operatorId = filters.operatorId.trim();
    if (filters.ownershipType) query.ownershipType = filters.ownershipType.trim();

    // Paginate results
    const buses = await Bus.find(query)
      .populate('operatorId')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalBuses = await Bus.countDocuments(query);

    res.status(200).json({ buses, total: totalBuses, page: Number(page), limit: Number(limit) });
  } catch (error) {
    logger.error(`Error searching buses: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

exports.createBus = async (req, res) => {
  try {
    // Validate request body
    const { error } = busSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Validation failed', details: error.details.map((e) => e.message) });
    }

    const { busNumber, capacity, operatorId, ownershipType, status } = req.body;

    // Validate operator existence
    const operator = await User.findById(operatorId);
    if (!operator) {
      return res.status(404).json({ error: 'Operator not found' });
    }

    // Create a new bus
    const bus = new Bus({ busNumber, capacity, operatorId, ownershipType, status });
    await bus.save();

    logger.info(`Bus created successfully: ${busNumber}`);
    res.status(201).json({ message: 'Bus created successfully', bus });
  } catch (error) {
    logger.error(`Error creating bus: ${error.message}`);
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

exports.updateBus = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error } = busSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Validation failed', details: error.details.map((e) => e.message) });
    }

    const { busNumber, capacity, operatorId, ownershipType, status } = req.body;

    // Validate operator if provided
    if (operatorId) {
      const operator = await User.findById(operatorId);
      if (!operator) {
        return res.status(404).json({ error: 'Operator not found' });
      }
    }

    // Find and update the bus
    const updatedBus = await Bus.findByIdAndUpdate(
      id,
      { busNumber, capacity, operatorId, ownershipType, status },
      { new: true, runValidators: true }
    );

    if (!updatedBus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    logger.info(`Bus updated successfully: ${id}`);
    res.status(200).json({ message: 'Bus updated successfully', bus: updatedBus });
  } catch (error) {
    logger.error(`Error updating bus: ${error.message}`);
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

exports.deleteBus = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by updating status
    const deletedBus = await Bus.findByIdAndUpdate(id, { status: 'MAINTENANCE' }, { new: true });
    if (!deletedBus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    logger.info(`Bus marked as maintenance: ${id}`);
    res.status(200).json({ message: 'Bus marked as maintenance successfully', bus: deletedBus });
  } catch (error) {
    logger.error(`Error deleting bus: ${error.message}`);
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

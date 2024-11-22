const Bus = require('../models/Bus');
const User = require('../models/User'); // Assuming User is the operator model

/**
 * Search Buses
 * Allows filtering by busNumber, capacity, operatorId, and ownershipType
 */
exports.searchBuses = async (req, res) => {
  try {
    const filter = {};

    // Add filters based on query parameters
    if (req.query.busNumber) filter.busNumber = new RegExp(`^${req.query.busNumber.trim()}$`, 'i'); // Case-insensitive
    if (req.query.capacity && !isNaN(req.query.capacity)) filter.capacity = parseInt(req.query.capacity);
    if (req.query.operatorId) filter.operatorId = req.query.operatorId.trim();
    if (req.query.ownershipType) filter.ownershipType = req.query.ownershipType.trim();

    // Fetch matching buses with populated operatorId
    const buses = await Bus.find(filter).populate('operatorId');
    res.status(200).json(buses);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

/**
 * Create a Bus
 * Validates operatorId before creating a bus
 */
exports.createBus = async (req, res) => {
  try {
    const { busNumber, capacity, operatorId, ownershipType, status } = req.body;

    // Validate operatorId
    const operator = await User.findById(operatorId);
    if (!operator) {
      return res.status(404).json({ error: 'Operator not found' });
    }

    // Create a new bus
    const bus = new Bus({ busNumber, capacity, operatorId, ownershipType, status });
    await bus.save();

    res.status(201).json({ message: 'Bus created successfully', bus });
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

/**
 * Update a Bus
 * Validates bus existence before updating
 */
exports.updateBus = async (req, res) => {
  try {
    const { id } = req.params;
    const { busNumber, capacity, operatorId, ownershipType, status } = req.body;

    // Validate operatorId if provided
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

    res.status(200).json({ message: 'Bus updated successfully', bus: updatedBus });
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

/**
 * Delete a Bus
 * Marks the bus as deleted using a soft delete mechanism
 */
exports.deleteBus = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by updating the status
    const deletedBus = await Bus.findByIdAndUpdate(id, { status: 'MAINTENANCE' }, { new: true });
    if (!deletedBus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    res.status(200).json({ message: 'Bus marked as maintenance successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

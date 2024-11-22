const TripSchedule = require('../models/TripSchedule');
const Bus = require('../models/Bus');
const Route = require('../models/Route');

/**
 * Get all trip schedules or search by query parameters
 * Dynamically filters trips based on busId, routeId, and tripId
 */
exports.getAllTripSchedules = async (req, res) => {
  try {
    const filter = {};
    if (req.query.busId) filter.busId = req.query.busId;
    if (req.query.routeId) filter.routeId = req.query.routeId;
    if (req.query.tripId) filter.tripId = req.query.tripId;

    // Populate related fields
    const schedules = await TripSchedule.find(filter).populate('busId routeId');
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

/**
 * Create a new trip schedule
 * Validates busId and routeId, and checks for schedule conflicts
 */
exports.createTripSchedule = async (req, res) => {
  try {
    const { busId, routeId, departureTime, arrivalTime } = req.body;

    // Validate busId
    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    // Validate routeId
    const route = await Route.findById(routeId);
    if (!route) return res.status(404).json({ error: 'Route not found' });

    // Check for schedule conflicts for the same bus
    const conflictingSchedules = await TripSchedule.find({
      busId,
      $or: [
        { departureTime: { $lt: arrivalTime, $gte: departureTime } },
        { arrivalTime: { $gt: departureTime, $lte: arrivalTime } }
      ]
    });

    if (conflictingSchedules.length > 0) {
      return res.status(400).json({ error: 'Schedule conflicts with an existing trip for this bus.' });
    }

    // Create the trip schedule
    const schedule = new TripSchedule(req.body);
    await schedule.save();
    res.status(201).json({ message: 'Trip schedule created successfully', schedule });
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

/**
 * Update an existing trip schedule
 * Validates busId and routeId if updated
 */
exports.updateTripSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { busId, routeId, departureTime, arrivalTime } = req.body;

    // Validate busId if provided
    if (busId) {
      const bus = await Bus.findById(busId);
      if (!bus) return res.status(404).json({ error: 'Bus not found' });
    }

    // Validate routeId if provided
    if (routeId) {
      const route = await Route.findById(routeId);
      if (!route) return res.status(404).json({ error: 'Route not found' });
    }

    // Check for schedule conflicts for the same bus if times are updated
    if (departureTime && arrivalTime && busId) {
      const conflictingSchedules = await TripSchedule.find({
        _id: { $ne: id }, // Exclude the current schedule
        busId,
        $or: [
          { departureTime: { $lt: arrivalTime, $gte: departureTime } },
          { arrivalTime: { $gt: departureTime, $lte: arrivalTime } }
        ]
      });

      if (conflictingSchedules.length > 0) {
        return res.status(400).json({ error: 'Schedule conflicts with an existing trip for this bus.' });
      }
    }

    // Find and update the schedule
    const updatedSchedule = await TripSchedule.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedSchedule) {
      return res.status(404).json({ error: 'Trip schedule not found' });
    }

    res.status(200).json({ message: 'Trip schedule updated successfully', schedule: updatedSchedule });
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

/**
 * Delete a trip schedule
 */
exports.deleteTripSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    // Perform hard deletion
    const deletedSchedule = await TripSchedule.findByIdAndDelete(id);
    if (!deletedSchedule) {
      return res.status(404).json({ error: 'Trip schedule not found' });
    }

    res.status(200).json({ message: 'Trip schedule deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

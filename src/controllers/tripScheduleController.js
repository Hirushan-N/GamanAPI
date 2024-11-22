const TripSchedule = require('../models/TripSchedule');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Joi = require('joi');
const logger = require('../utils/logger');

// Joi validation schema for trip schedules
const tripScheduleSchema = Joi.object({
  busId: Joi.string().required(),
  routeId: Joi.string().required(),
  tripName: Joi.string().required(),
  departureTime: Joi.date().iso().required(),
  arrivalTime: Joi.date().iso().required(),
  stopsSchedule: Joi.array()
    .items(
      Joi.object({
        stopName: Joi.string().required(),
        time: Joi.date().iso().required(),
      })
    )
    .required(),
  activeDays: Joi.array().items(Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')).required(),
});

exports.getAllTripSchedules = async (req, res) => {
  try {
    const filter = {};
    if (req.query.busId) filter.busId = req.query.busId;
    if (req.query.routeId) filter.routeId = req.query.routeId;
    if (req.query.tripId) filter.tripId = req.query.tripId;

    const schedules = await TripSchedule.find(filter).populate('busId routeId');
    res.status(200).json(schedules);
  } catch (error) {
    logger.error(`Error fetching trip schedules: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

exports.createTripSchedule = async (req, res) => {
  try {
    // Validate request body
    const { error } = tripScheduleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Validation failed', details: error.details.map((e) => e.message) });
    }

    const { busId, routeId, departureTime, arrivalTime } = req.body;

    // Validate bus existence
    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    // Validate route existence
    const route = await Route.findById(routeId);
    if (!route) return res.status(404).json({ error: 'Route not found' });

    // Check for schedule conflicts
    const conflictingSchedules = await TripSchedule.find({
      busId,
      $or: [
        { departureTime: { $lt: arrivalTime, $gte: departureTime } },
        { arrivalTime: { $gt: departureTime, $lte: arrivalTime } },
      ],
    });

    if (conflictingSchedules.length > 0) {
      return res.status(400).json({ error: 'Schedule conflicts with an existing trip for this bus.' });
    }

    const schedule = new TripSchedule(req.body);
    await schedule.save();

    logger.info(`Trip schedule created successfully: ${schedule._id}`);
    res.status(201).json({ message: 'Trip schedule created successfully', schedule });
  } catch (error) {
    logger.error(`Error creating trip schedule: ${error.message}`);
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

exports.updateTripSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error } = tripScheduleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Validation failed', details: error.details.map((e) => e.message) });
    }

    const { busId, routeId, departureTime, arrivalTime } = req.body;

    // Validate bus if provided
    if (busId) {
      const bus = await Bus.findById(busId);
      if (!bus) return res.status(404).json({ error: 'Bus not found' });
    }

    // Validate route if provided
    if (routeId) {
      const route = await Route.findById(routeId);
      if (!route) return res.status(404).json({ error: 'Route not found' });
    }

    // Check for schedule conflicts if times are updated
    if (departureTime && arrivalTime && busId) {
      const conflictingSchedules = await TripSchedule.find({
        _id: { $ne: id },
        busId,
        $or: [
          { departureTime: { $lt: arrivalTime, $gte: departureTime } },
          { arrivalTime: { $gt: departureTime, $lte: arrivalTime } },
        ],
      });

      if (conflictingSchedules.length > 0) {
        return res.status(400).json({ error: 'Schedule conflicts with an existing trip for this bus.' });
      }
    }

    const updatedSchedule = await TripSchedule.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedSchedule) {
      return res.status(404).json({ error: 'Trip schedule not found' });
    }

    logger.info(`Trip schedule updated successfully: ${id}`);
    res.status(200).json({ message: 'Trip schedule updated successfully', schedule: updatedSchedule });
  } catch (error) {
    logger.error(`Error updating trip schedule: ${error.message}`);
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

exports.deleteTripSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSchedule = await TripSchedule.findByIdAndDelete(id);
    if (!deletedSchedule) {
      return res.status(404).json({ error: 'Trip schedule not found' });
    }

    logger.info(`Trip schedule deleted successfully: ${id}`);
    res.status(200).json({ message: 'Trip schedule deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting trip schedule: ${error.message}`);
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

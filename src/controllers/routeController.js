const Route = require('../models/Route');
const Joi = require('joi');
const logger = require('../utils/logger');

// Joi validation schema for routes
const routeSchema = Joi.object({
  routeNumber: Joi.string().required(),
  startLocation: Joi.string().required(),
  endLocation: Joi.string().required(),
  stops: Joi.array()
    .items(
      Joi.object({
        stopName: Joi.string().required(),
        stopType: Joi.string().valid('REGULAR', 'MAJOR').required(),
        gpsCoordinates: Joi.object({
          latitude: Joi.number().required(),
          longitude: Joi.number().required(),
        }).required(),
      })
    )
    .required(),
  variant: Joi.string().valid('EXPRESS', 'REGULAR').default('REGULAR'),
  distance: Joi.number().required(),
  averageSpeed: Joi.number().required(),
  duration: Joi.number().required(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
});

exports.searchRoutes = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;

    // Build query filters
    const query = {};
    if (filters.routeNumber) query.routeNumber = new RegExp(`^${filters.routeNumber.trim()}$`, 'i');
    if (filters.startLocation) query.startLocation = new RegExp(filters.startLocation.trim(), 'i');
    if (filters.endLocation) query.endLocation = new RegExp(filters.endLocation.trim(), 'i');
    if (filters.stops) query.stops = { $elemMatch: { stopName: new RegExp(filters.stops.trim(), 'i') } };

    // Paginate results
    const routes = await Route.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalRoutes = await Route.countDocuments(query);

    res.status(200).json({ routes, total: totalRoutes, page: Number(page), limit: Number(limit) });
  } catch (error) {
    logger.error(`Error searching routes: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

exports.createRoute = async (req, res) => {
  try {
    // Validate request body
    const { error } = routeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Validation failed', details: error.details.map((e) => e.message) });
    }

    const { routeNumber, stops } = req.body;

    // Validate unique routeNumber
    const existingRoute = await Route.findOne({ routeNumber });
    if (existingRoute) {
      return res.status(400).json({ error: 'Route number already exists.' });
    }

    // Validate duplicate stops
    const uniqueStops = new Set(stops.map((stop) => stop.stopName));
    if (uniqueStops.size !== stops.length) {
      return res.status(400).json({ error: 'Duplicate stops detected in the route.' });
    }

    // Create a new route
    const route = new Route(req.body);
    await route.save();

    logger.info(`Route created successfully: ${routeNumber}`);
    res.status(201).json({ message: 'Route created successfully', route });
  } catch (error) {
    logger.error(`Error creating route: ${error.message}`);
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error } = routeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'Validation failed', details: error.details.map((e) => e.message) });
    }

    const { routeNumber, stops } = req.body;

    // Validate unique routeNumber
    if (routeNumber) {
      const existingRoute = await Route.findOne({ routeNumber, _id: { $ne: id } });
      if (existingRoute) {
        return res.status(400).json({ error: 'Route number already exists for another route.' });
      }
    }

    // Validate duplicate stops
    if (stops) {
      const uniqueStops = new Set(stops.map((stop) => stop.stopName));
      if (uniqueStops.size !== stops.length) {
        return res.status(400).json({ error: 'Duplicate stops detected in the updated route.' });
      }
    }

    // Find and update the route
    const updatedRoute = await Route.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedRoute) {
      return res.status(404).json({ error: 'Route not found.' });
    }

    logger.info(`Route updated successfully: ${id}`);
    res.status(200).json({ message: 'Route updated successfully', route: updatedRoute });
  } catch (error) {
    logger.error(`Error updating route: ${error.message}`);
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    // Mark route as inactive (soft delete)
    const deletedRoute = await Route.findByIdAndUpdate(id, { status: 'INACTIVE' }, { new: true });
    if (!deletedRoute) {
      return res.status(404).json({ error: 'Route not found.' });
    }

    logger.info(`Route marked as inactive: ${id}`);
    res.status(200).json({ message: 'Route marked as inactive successfully.' });
  } catch (error) {
    logger.error(`Error deleting route: ${error.message}`);
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

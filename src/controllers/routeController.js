const Route = require('../models/Route');

exports.searchRoutes = async (req, res) => {
  try {
    const filter = {};
    if (req.query.routeNumber && req.query.routeNumber.trim()) filter.routeNumber = req.query.routeNumber.trim();
    if (req.query.startLocation && req.query.startLocation.trim()) filter.startLocation = req.query.startLocation.trim();
    if (req.query.endLocation && req.query.endLocation.trim()) filter.endLocation = req.query.endLocation.trim();
    if (req.query.stops && req.query.stops.trim()) filter.stops = { $in: [req.query.stops.trim()] };

    const routes = await Route.find(filter);
    res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.createRoute = async (req, res) => {
  try {
    const route = new Route(req.body);
    await route.save();
    res.status(201).json({ message: 'Route created successfully', route });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRoute = await Route.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: 'Route updated successfully', route: updatedRoute });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;
    await Route.findByIdAndDelete(id);
    res.status(200).json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

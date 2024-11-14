const TripSchedule = require('../models/TripSchedule');

// Get all trip schedules or search by query parameters
exports.getAllTripSchedules = async (req, res) => {
  try {
    const filter = {};
    if (req.query.busId) filter.busId = req.query.busId;
    if (req.query.routeId) filter.routeId = req.query.routeId;
    if (req.query.tripId) filter.tripId = req.query.tripId;

    const schedules = await TripSchedule.find(filter).populate('busId routeId');
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new trip schedule
exports.createTripSchedule = async (req, res) => {
  try {
    const schedule = new TripSchedule(req.body);
    await schedule.save();
    res.status(201).json({ message: 'Trip schedule created successfully', schedule });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an existing trip schedule
exports.updateTripSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSchedule = await TripSchedule.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedSchedule) {
      return res.status(404).json({ error: 'Trip schedule not found' });
    }
    res.status(200).json({ message: 'Trip schedule updated successfully', schedule: updatedSchedule });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a trip schedule
exports.deleteTripSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSchedule = await TripSchedule.findByIdAndDelete(id);

    if (!deletedSchedule) {
      return res.status(404).json({ error: 'Trip schedule not found' });
    }
    res.status(200).json({ message: 'Trip schedule deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

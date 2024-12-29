const Schedule = require('../models/Schedule');
const Joi = require('joi');

// Joi schema for validation
const scheduleSchema = Joi.object({
  scheduleName: Joi.string().required(),
  routeId: Joi.string().required(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
});

// Get all schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().populate('routeId');
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Get a single schedule by ID
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate('routeId');
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Create a schedule
exports.createSchedule = async (req, res) => {
  try {
    const { error } = scheduleSchema.validate(req.body);
    if (error) return res.status(400).json({ error: 'Validation failed', details: error.details });

    const schedule = new Schedule(req.body);
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

// Update a schedule
exports.updateSchedule = async (req, res) => {
  try {
    const { error } = scheduleSchema.validate(req.body);
    if (error) return res.status(400).json({ error: 'Validation failed', details: error.details });

    const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSchedule) return res.status(404).json({ error: 'Schedule not found' });

    res.status(200).json(updatedSchedule);
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

// Delete a schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!deletedSchedule) return res.status(404).json({ error: 'Schedule not found' });

    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

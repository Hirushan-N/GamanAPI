const ScheduleEntry = require('../models/ScheduleEntry');
const Joi = require('joi');

// Joi schema for validation
const scheduleEntrySchema = Joi.object({
  scheduleId: Joi.string().required(),
  busId: Joi.string().required(),
  departureTerminal: Joi.string().required(),
  arrivalTerminal: Joi.string().required(),
  departureTime: Joi.date().iso().required(),
  arrivalTime: Joi.date().iso().required(),
  stopsSchedule: Joi.array().items(
    Joi.object({
      stop: Joi.string().required(),
      time: Joi.date().iso().required(),
    })
  ).required(),
  activeDays: Joi.array().items(Joi.string().valid('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN')).required(),
});

// Get all schedule entries
exports.getAllScheduleEntries = async (req, res) => {
  try {
    const entries = await ScheduleEntry.find().populate('scheduleId busId');
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Get a single schedule entry by ID
exports.getScheduleEntryById = async (req, res) => {
  try {
    const entry = await ScheduleEntry.findById(req.params.id).populate('scheduleId busId');
    if (!entry) return res.status(404).json({ error: 'Schedule entry not found' });
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Create a schedule entry
exports.createScheduleEntry = async (req, res) => {
  try {
    const { error } = scheduleEntrySchema.validate(req.body);
    if (error) return res.status(400).json({ error: 'Validation failed', details: error.details });

    const entry = new ScheduleEntry(req.body);
    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

// Update a schedule entry
exports.updateScheduleEntry = async (req, res) => {
  try {
    const { error } = scheduleEntrySchema.validate(req.body);
    if (error) return res.status(400).json({ error: 'Validation failed', details: error.details });

    const updatedEntry = await ScheduleEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEntry) return res.status(404).json({ error: 'Schedule entry not found' });

    res.status(200).json(updatedEntry);
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

// Delete a schedule entry
exports.deleteScheduleEntry = async (req, res) => {
  try {
    const deletedEntry = await ScheduleEntry.findByIdAndDelete(req.params.id);
    if (!deletedEntry) return res.status(404).json({ error: 'Schedule entry not found' });

    res.status(200).json({ message: 'Schedule entry deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', details: error.message });
  }
};

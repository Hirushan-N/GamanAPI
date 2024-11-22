const Joi = require('joi');

// Middleware for validating request data
const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false }); // Validate the request body
  if (error) {
    // Format the validation error messages
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({ error: 'Validation failed', details: errorMessages });
  }
  next(); // Proceed if validation passes
};

// Middleware for validating query parameters
const validateQuery = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({ error: 'Query validation failed', details: errorMessages });
  }
  next();
};

// Middleware for validating URL parameters
const validateParams = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.params, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({ error: 'URL parameter validation failed', details: errorMessages });
  }
  next();
};

module.exports = { validateRequest, validateQuery, validateParams };

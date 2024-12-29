const { createLogger, format, transports } = require('winston');

// Create a logger instance
const logger = createLogger({
  level: 'info', // Default logging level
  format: format.combine(
    format.timestamp(), // Add timestamp to logs
    format.errors({ stack: true }), // Include stack trace for errors
    format.json() // Log in JSON format for better structure
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(), // Colorize logs for better readability in the console
        format.printf(({ timestamp, level, message, stack }) => {
          return stack
            ? `[${timestamp}] ${level}: ${message}\n${stack}` // For errors with stack traces
            : `[${timestamp}] ${level}: ${message}`; // For other log levels
        })
      ),
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }), // Log errors to a file
    new transports.File({ filename: 'logs/combined.log' }), // Log all messages to a combined file
  ],
});

// Add stream support for external logging tools (e.g., Morgan for HTTP requests)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;

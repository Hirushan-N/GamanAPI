const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const swaggerSetup = require('./swagger');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const busRoutes = require('./routes/busRoutes');
const routeRoutes = require('./routes/routeRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const scheduleEntryRoutes = require('./routes/scheduleEntryRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const morgan = require('morgan');
const logger = require('./utils/logger');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Simple "Hello" endpoint
app.get('/', (req, res) => {
    res.send('Hello from Gaman API!');
});

//============================ROUTES============================//
app.use('/api/auth', authRoutes); // Use auth routes
app.use('/api/users', userRoutes); // Use users routes
app.use('/api/buses', busRoutes); // Use bus routes
app.use('/api/routes', routeRoutes); // Use bus-routes routes
app.use('/api/schedules', scheduleRoutes); // Use schedules routes
app.use('/api/schedules', scheduleEntryRoutes); // Use schedules routes
app.use('/api/tickets', ticketRoutes); // Use tickets routes
app.use(morgan('combined', { stream: logger.stream }));


swaggerSetup(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Gaman API is running on http://localhost:${PORT}`);
  console.log(`Swagger Documentataion running on http://localhost:${PORT}/api-docs`);

});

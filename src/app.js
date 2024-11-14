const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Gaman API is running on http://localhost:${PORT}`);
});
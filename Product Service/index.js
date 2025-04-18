require('dotenv').config();
const express = require('express');
const logger = require('./src/config/logger');
const productRoutes = require('./src/routes/productRoutes');
const { connectDB } = require('./src/config/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Middleware to parse JSON
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: '*',
  methods: 'GET, POST, PUT, DELETE, PATCH, HEAD',
  credentials: true,
};
app.use(cors(corsOptions));

// Connect to MongoDB
connectDB();

// Register routes
app.use('/api/products', productRoutes);

// Error handling
app.use((err, req, res, next) => {
  logger.error('Internal Server Error:', {
    message: err.message,
    stack: err.stack,
    requestBody: req.body,
  });
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => logger.info(`Product Service running on port ${PORT}`));
require('dotenv').config();
const express = require('express');
const logger = require('./src/config/logger');
const categoryRoutes = require('./src/routes/categoryRoutes');
const { connectDB } = require('./src/config/db');
const cors = require('cors');
const bodyParser = require('body-parser');

const corsOptions = {
  origin: '*',
  methods: 'GET, POST, PUT, DELETE, PATCH, HEAD',
  credentials: true,
};

const app = express();

// Middleware
app.use(cors(corsOptions));

// Increase payload size limit
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// Connect to MongoDB
connectDB();

// Register routes
app.use('/api/categories', categoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Internal Server Error:', {
    message: err.message,
    stack: err.stack,
    requestBody: req.body,
  });
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => logger.info(`Categories Service running on port ${PORT}`));

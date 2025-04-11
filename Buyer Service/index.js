require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const logger = require('./src/config/logger');

const app = express();

// Middleware
app.use(express.json());

const cors = require("cors");
var corsOptions = {
    origin: "*",
    methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
    Credential: true
}
app.use(cors(corsOptions));
// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);

// Error handling
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.stack}`);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
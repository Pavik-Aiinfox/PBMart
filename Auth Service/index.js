require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const logger = require('./src/config/logger');

const app = express();

app.use(express.json());

connectDB();

const cors = require("cors");
var corsOptions = {
    origin: "*",
    methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
    Credential: true
}
app.use(cors(corsOptions));

app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.stack}`);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  logger.info(`AuthService running on port ${PORT}`);
});
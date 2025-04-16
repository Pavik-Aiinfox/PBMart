require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/database');
const sellerRoutes = require('./src/routes/sellerRoutes');
const errorMiddleware = require('./src/middlewares/errorMiddleware');
const logger = require('./src/config/logger');
require('dotenv').config();
const port = process.env.PORT || 1234;
const helmet = require('helmet');
const cors = require('cors');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());


const corsOptions = {
    origin: '*',
    methods: 'GET, POST, PUT, DELETE, PATCH, HEAD',
    credentials: true,
  };
app.use(cors(corsOptions));

app.use('/api/seller', sellerRoutes);

app.use(errorMiddleware);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error(`Server startup error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
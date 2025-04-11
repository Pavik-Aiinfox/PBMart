require('dotenv').config();
const express = require('express');
const logger = require('./src/config/logger');
const productRoutes = require('./src/routes/productRoutes');
const { connectDB } = require('./src/config/db');
const cors = require('cors');
const corsOptions = {
  origin: '*',
  methods: 'GET, POST, PUT, DELETE, PATCH, HEAD',
  credentials: true,
};
const multer = require('multer');

const app = express();

// Middleware to parse JSON (for text fields)
app.use(express.json());

// Middleware for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

// Custom middleware to handle multipart/form-data and combine with JSON
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) {
    // Parse form-data with Multer for files
    upload.fields([{ name: 'images', maxCount: 10 }])(req, res, (err) => {
      if (err) {
        return next(err);
      }
      // Allow other fields to pass through to req.body
      next();
    });
  } else {
    next(); // Proceed for JSON requests
  }
});

app.use(cors(corsOptions));

// Connect to MongoDB
connectDB();

// Register routes
app.use('/api/products', productRoutes);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  logger.error('Internal Server Error:', {
    message: err.message,
    stack: err.stack,
    requestBody: req.body,
    files: req.files,
  });
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => logger.info(`Product Service running on port ${PORT}`));
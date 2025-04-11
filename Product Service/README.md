# Product Service

A microservice for managing products, including creation, retrieval, updates, and deletion, with integration to the Categories Service for category associations.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)

## Overview
The Product Service is a Node.js-based microservice designed to manage product data, including details such as name, description, price, and category associations. It integrates with the Categories Service (running on `http://localhost:3005`) to ensure valid category references and uses MongoDB Atlas for persistent storage. This service is part of a larger e-commerce or marketplace ecosystem.

## Features
- Create, read, update, and delete (CRUD) product records.
- Associate products with categories from the Categories Service.
- Validate category existence before product creation or update.
- Log operations using a Winston logger with file rotation.
- Serve API on a configurable port (default: 3004).

## Prerequisites
- Node.js (v14.x or later)
- npm (v6.x or later)
- MongoDB Atlas account with a connection string
- Categories Service running on `http://localhost:3005`
- Git (for cloning the repository)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/product-service.git
   cd product-service
2. Install dependencies:
   npm install
3. Create a .env file in the root directory and add the required environment variables (see ).
4. Ensure the Categories Service is running or update the CATEGORIES_SERVICE_URL in the .env file to point to its location.

Usage
1. Start the service in development mode:
   ```bash
   npm run dev
- This uses nodemon to automatically restart on file changes.
2. Start the service in production mode:
  ```bash
  npm start
3. The service will be available at http://localhost:3004 by default.

API Endpoints
Base URL
http://localhost:3004/api/products

Endpoints
- GET /api/products
   - Description: Retrieve all products.
   - Query Parameters: categoryId (optional, filters by category).
   - Response: 200 OK with array of products.
- json
   - {
  "success": true,
  "data": [
    {
      "_id": "67f8eb98cd0ff51ec4f5c2d5",
      "name": "Sample Product",
      "description": "A great product",
      "price": 99.99,
      "categoryId": "67f8eb98cd0ff51ec4f5c2d5",
      "createdAt": "2025-04-11T04:10:00Z",
      "updatedAt": "2025-04-11T04:10:00Z"
     }
  ]
}

- GET /api/products/:id
  - Description: Retrieve a specific product by ID.
  - Response: 200 OK with product details or 404 Not Found if invalid ID.
- POST /api/products
  - Description: Create a new product.
 Body:
{
  "name": "New Product",
  "description": "A new item",
  "price": 49.99,
  "categoryId": "67f8eb98cd0ff51ec4f5c2d5"
}
 - Response: 201 Created with the new product.

- PUT /api/products/:id
   - Description: Update a product by ID.
   - Body: Similar to POST body.
   - Response: 200 OK with updated product.

- DELETE /api/products/:id
  - Description: Delete a product by ID.
  - Response: 200 OK with { "success": true, "message": "Product deleted" } or 409 Conflict if linked to active orders.

Environment Variables
Create a .env file in the root directory with the following variables:
MONGO_URI=mongodb+srv://pavikaiinfox:7jH88Gq3J6zEfuFG@microservices.cyjlgf2.mongodb.net/?retryWrites=true&w=majority&appName=microservices
JWT_SECRET=secret-key
NODE_ENV=development
PORT=3004
CATEGORIES_SERVICE_URL=http://localhost:3005/api/categories












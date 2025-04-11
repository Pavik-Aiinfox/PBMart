# Categories Service

A Node.js-based microservice for managing category hierarchies, including creation, retrieval, updates, and deletion, with integration to a Product Service for category-product associations.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Running the Tests](#running-the-tests)

## Overview
The Categories Service is designed to manage a hierarchical structure of categories (e.g., "Agriculture and Food Industry" with subcategories like "Agricultural Equipment") for an e-commerce or marketplace application. It uses MongoDB Atlas for persistent storage and integrates with a Product Service (running on `http://localhost:3004`) to validate category references. The service is built with Express.js, Mongoose, and Winston for logging, and it supports CRUD operations with JWT-based authentication for protected endpoints.

## Features
- Create, read, update, and delete (CRUD) category records.
- Support for hierarchical category structures with parent-child relationships.
- Validate parent category existence before creating or updating subcategories.
- Integrate with the Product Service to prevent deletion of categories with associated products.
- Log operations to a rotating file (`combined.log`) with Winston.
- Serve API on a configurable port (default: 3005).

## Prerequisites
- Node.js (v14.x or later)
- npm (v6.x or later)
- MongoDB Atlas account with a connection string
- Product Service running on `http://localhost:3004` (or update the URL)
- Git (for cloning the repository)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Categories Service.git
   cd Categories Service
2. Install dependencies:
   npm install
3. Create a .env file in the root directory and add the required environment variables (see ).
4. Seed the database with initial categories:
   ```bash
   npm run seed
5. Ensure the Product Service is running or update the PRODUCT_SERVICE_URL in the .env file to point to its location.

Usage
1. Start the service in development mode:
   ```bash
   npm run dev
This uses nodemon to automatically restart on file changes.
2. Start the service in production mode:
    ```bash
    npm run dev
This uses nodemon to automatically restart on file changes.

API Endpoints
Base URL
http://localhost:3005/api/categories

- Endpoints
  - GET /api/categories
    - Description: Retrieve all categories.
    - Query Parameters: parentId (optional, filters by parent category ID).
    - Response: 200 OK with array of categories.
 - json
{
  "success": true,
  "data": [
    {
      "_id": "67f8eb98cd0ff51ec4f5c2d5",
      "name": "Agriculture and Food Industry",
      "parentId": null,
      "attributes": [],
      "createdAt": "2025-04-11T10:14:48.606Z",
      "updatedAt": "2025-04-11T10:14:48.606Z"
    },
    {
      "_id": "67f8eb98cd0ff51ec4f5c2d6",
      "name": "Agricultural Equipment",
      "parentId": "67f8eb98cd0ff51ec4f5c2d5",
      "attributes": [],
      "createdAt": "2025-04-11T10:14:48.650Z",
      "updatedAt": "2025-04-11T10:14:48.650Z"
    }
    // ... (62 more entries)
  ]
}

- GET /api/categories/:id
  - Description: Retrieve a specific category with its subcategories.
  - Response: 200 OK with category details or 404 Not Found if invalid ID
{
  "success": true,
  "data": {
    "_id": "67f8eb98cd0ff51ec4f5c2d5",
    "name": "Agriculture and Food Industry",
    "parentId": null,
    "attributes": [],
    "createdAt": "2025-04-11T10:14:48.606Z",
    "updatedAt": "2025-04-11T10:14:48.606Z",
    "subcategories": [
      { "_id": "67f8eb98cd0ff51ec4f5c2d6", "name": "Agricultural Equipment", "parentId": "67f8eb98cd0ff51ec4f5c2d5", ... }
      // ... (other subcategories)
    ]
  }
}

 - POST /api/categories
   - Description: Create a new category.
   - Body:
json
{
  "name": "New Category",
  "parentId": "67f8eb98cd0ff51ec4f5c2d5",
  "attributes": [
    { "name": "new attribute", "value": "new value" }
  ]
}
Response: 201 Created with the new category.

- PUT /api/categories/:id
  - Description: Update a category by ID.
  - Body: Similar to POST body.
  - Response: 200 OK with updated category.

- DELETE /api/categories/:id
  - Description: Delete a category by ID.
  - Response: 200 OK with { "success": true, "message": "Category deleted" } or 409 Conflict if subcategories or products exist.

- Environment Variables
 - Create a .env file in the root directory with the following variables:
MONGO_URI=mongodb+srv://<username>:<password>@microservices.cyjlgf2.mongodb.net/test?retryWrites=true&w=majority
JWT_SECRET=your-very-secure-secret-key
NODE_ENV=development
PORT=3005
PRODUCT_SERVICE_URL=http://localhost:3004/api/products








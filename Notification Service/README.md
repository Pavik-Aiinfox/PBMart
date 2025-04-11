# Notification Service

A Node.js-based microservice for handling notifications, including emails, push notifications, and in-app alerts, integrated with the Product Service and Categories Service for e-commerce or marketplace updates.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)

## Overview
The Notification Service is designed to manage and send notifications to users based on events in an e-commerce or marketplace application. It integrates with the Product Service (running on `http://localhost:3004`) and Categories Service (running on `http://localhost:3005`) to trigger notifications for product updates, category changes, or order-related activities. The service uses MongoDB Atlas for storing notification logs and supports multiple notification channels (e.g., email, SMS, push notifications) via configurable providers. It is built with Express.js, Mongoose, and Winston for logging.

## Features
- Send notifications via email, SMS, or in-app alerts.
- Trigger notifications for product creation, updates, or deletions.
- Log all notification attempts and successes/failures.
- Serve API on a configurable port (default: 3003).


## Prerequisites
- Node.js (v18.x or later)
- npm (v6.x or later)
- MongoDB Atlas account with a connection string
- Product Service running on `http://localhost:3004`
- Categories Service running on `http://localhost:3005`
- Notification provider credentials (e.g., SendGrid for email)
- Git (for cloning the repository)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Notification Service.git
   cd Notification Service
2. Install dependencies:
   ```bash
   npm install
3. Create a .env file in the root directory and add the required environment variables (see ).
4. Ensure the Product Service and Categories Service are running, or update their URLs in the .env file.

Usage
1. Start the service in development mode:
   ```bash
   npm install
This uses nodemon to automatically restart on file changes.
2. Start the service in production mode:
    ```bash
   npm start
3. The service will be available at http://localhost:3003 by default.

Environment Variables
Create a .env file in the root directory with the following variables:
# Application settings
PORT=3003
NODE_ENV=production

# MongoDB Atlas connection
MONGO_URI=mongodb+srv://pavikaiinfox:7jH88Gq3J6zEfuFG@microservices.cyjlgf2.mongodb.net/?retryWrites=true&w=majority&appName=microservices

# RabbitMQ connection (running in Docker)
RABBITMQ_URL=amqp://rabbitmq:5672





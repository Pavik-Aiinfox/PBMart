const amqp = require('amqplib');
const logger = require('./logger');

let channel = null;

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue('product_events', { durable: true });
    logger.info('Connected to RabbitMQ for product events');
  } catch (error) {
    logger.error('RabbitMQ connection error:', error.message);
    throw error;
  }
}

function publishEvent(eventType, product) {
  if (channel) {
    const message = JSON.stringify({ eventType, product });
    channel.sendToQueue('product_events', Buffer.from(message), { persistent: true });
    logger.info(`Published ${eventType} event for product ${product.id}`);
  } else {
    logger.warn('RabbitMQ channel not available, event not published');
  }
}

module.exports = { connectRabbitMQ, publishEvent };
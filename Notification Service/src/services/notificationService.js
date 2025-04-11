const amqp = require('amqplib');
const logger = require('../config/logger');
const Notification = require('../models/notificationModel');

let channel;

class NotificationService {
  static async connectRabbitMQ() {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL);
      channel = await connection.createChannel();
      await channel.assertQueue('notification_queue', { durable: true });
      logger.info('Notification Service connected to RabbitMQ');
    } catch (error) {
      logger.error(`RabbitMQ connection error: ${error.message}`);
      throw error;
    }
  }

  static async sendSMS(mobile, otp) {
    const message = `Your OTP is ${otp}. Valid 5 mins.`;
    // Mock SMS sending (replace with real SMS provider like Twilio)
    console.log(`SMS to ${mobile}: ${message}`);
    logger.info(`SMS sent to ${mobile}: ${message}`);

    // Store notification in MongoDB
    const notification = new Notification({ mobile, message });
    await notification.save();
  }

  static async startListening() {
    await this.connectRabbitMQ();

    channel.consume('notification_queue', async (msg) => {
      if (msg !== null) {
        const { mobile, otp } = JSON.parse(msg.content.toString());
        await this.sendSMS(mobile, otp);
        channel.ack(msg);
      }
    }, { noAck: false });

    logger.info('Notification Service listening for OTP events');
  }
}

module.exports = NotificationService;
const crypto = require('crypto');
const { jwtSecret } = require('../config');
const logger = require('../config/logger');

const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(jwtSecret, 'salt', 32);

const encrypt = (text) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    logger.error(`Encryption error: ${error.message}`);
    throw error;
  }
};

const decrypt = (encryptedText) => {
  try {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    logger.error(`Decryption error: ${error.message}`);
    throw error;
  }
};

module.exports = { encrypt, decrypt };
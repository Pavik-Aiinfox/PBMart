module.exports = {
    STATUS_CODES: {
      OK: 200,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      NOT_FOUND: 404,
      TOO_MANY_REQUESTS: 429,
      SERVER_ERROR: 500
    },
    MESSAGES: {
      SUCCESS: 'Success',
      SIGNUP_SUCCESS: 'User registered successfully',
      OTP_SENT: 'OTP sent successfully',
      INVALID_OTP: 'Invalid or expired OTP',
      TOO_MANY_ATTEMPTS: 'Too many failed attempts',
      TOO_MANY_REQUESTS: 'Rate limit exceeded, try again later',
      MOBILE_IN_USE: 'Mobile already in use',
      SERVER_ERROR: 'Something went wrong!'
    },
    OTP_EXPIRY_MINUTES: 5,
    MAX_FAILED_ATTEMPTS: 3,
    JWT_EXPIRY: '24h',
    USER_ROLE: 'user'
  };
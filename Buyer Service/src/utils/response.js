const { STATUS_CODES } = require('./constants');

const successResponse = (res, data, message = 'Success') => {
  return res.status(STATUS_CODES.OK).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, message = 'Error', status = STATUS_CODES.BAD_REQUEST) => {
  return res.status(status).json({
    success: false,
    message
  });
};

module.exports = { successResponse, errorResponse };
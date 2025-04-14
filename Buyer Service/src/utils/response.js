const successResponse = (res, data, message) => {
  res.status(200).json({ success: true, data, message });
};

const errorResponse = (res, message, status = 400) => {
  res.status(status).json({ success: false, message });
};

module.exports = { successResponse, errorResponse };
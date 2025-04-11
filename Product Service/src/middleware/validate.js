const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().min(0).required(),
  images: Joi.array().items(Joi.string()).optional(),
  stock: Joi.number().min(0).required(),
  sellerId: Joi.string().required(),
  categoryId: Joi.string().required(),
  status: Joi.string().valid('active', 'inactive', 'outofstock').optional(),
});

const bulkUploadSchema = Joi.object({
  file: Joi.object().required(),
}).unknown(true);

const validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
};

const validateBulkUpload = (req, res, next) => {
  const { error } = bulkUploadSchema.validate(req);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
};

module.exports = { validateProduct, validateBulkUpload };
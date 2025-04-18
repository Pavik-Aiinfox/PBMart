const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().min(0).required(),
  images: Joi.array().items(Joi.string().pattern(/^data:image\/(jpeg|png|gif);base64,/)).optional(),
  stock: Joi.number().min(0).required(),
  sellerId: Joi.string().required(),
  categoryId: Joi.string().required(),
  subCategoryId: Joi.string().required(),
  status: Joi.string().valid('active', 'inactive', 'outofstock').default('active').optional(),
});

const bulkUploadSchema = Joi.object({
  file: Joi.object().required(),
}).unknown(true);

const validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ success: false, message: error.details.map(d => d.message) });
  next();
};

const validateBulkUpload = (req, res, next) => {
  const { error } = bulkUploadSchema.validate(req, { abortEarly: false });
  if (error) return res.status(400).json({ success: false, message: error.details.map(d => d.message) });
  next();
};

module.exports = { validateProduct, validateBulkUpload };
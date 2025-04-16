const Joi = require('joi');

const categorySchema = Joi.object({
  name: Joi.string().required(),
  parentId: Joi.string().optional(),
  attributes: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        value: Joi.string().required(),
      })
    )
    .optional(),
  image: Joi.string()
    .pattern(/^data:image\/[a-zA-Z]+;base64,/)
    .optional()
    .allow(null),
  description: Joi.string().optional().allow(''),
});

const addCategorySchema = Joi.object({
  name: Joi.string().required(),
  parentId: Joi.string().optional(),
  attributes: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        value: Joi.string().required(),
      })
    )
    .optional(),
  image: Joi.string()
    .pattern(/^data:image\/[a-zA-Z]+;base64,/)
    .optional()
    .allow(null),
  description: Joi.string().optional().allow(''),
  subcategories: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        description: Joi.string().optional().allow(''), // Explicitly allow description
      })
    )
    .optional(),
});

const validateCategory = (req, res, next) => {
  console.log('Validating request for path:', req.path); // Debug log
  let schema = categorySchema;
  if (req.path === '/add') {
    schema = addCategorySchema;
    console.log('Using addCategorySchema'); // Debug log
  }
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    console.log('Validation error:', error.details); // Debug log
    return res.status(400).json({ success: false, message: error.details.map((err) => err.message).join(', ') });
  }
  next();
};

module.exports = { validateCategory };
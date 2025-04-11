const Joi = require('joi');

const categorySchema = Joi.object({
  name: Joi.string().required(),
  parentId: Joi.string().optional().allow(null),
  attributes: Joi.array().items(Joi.object({ name: Joi.string(), value: Joi.string() })).optional(),
});

const validateCategory = (req, res, next) => {
  const { error } = categorySchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  next();
};

module.exports = { validateCategory };
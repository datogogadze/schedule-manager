const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().min(8).max(254).lowercase().trim().required(),
  firstName: Joi.string().min(3).max(128).trim().required(),
  lastName: Joi.string().min(3).max(128).trim().required(),
  password: Joi.string().min(8).max(128).required(),
  passwordConfirmation: Joi.valid(Joi.ref('password')).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().min(8).max(254).lowercase().trim().required(),
  password: Joi.string().min(8).max(128).required(),
});

const passwordSchema = Joi.object({
  password: Joi.string().min(8).max(128).required(),
  passwordConfirmation: Joi.valid(Joi.ref('password')).required(),
});

const emailSchema = Joi.object({
  email: Joi.string().email().min(8).max(254).lowercase().trim().required(),
});

const boardSchema = Joi.object({
  name: Joi.string().min(3).max(254).lowercase().trim().required(),
  role: Joi.string().min(3).max(254).lowercase().trim().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  passwordSchema,
  emailSchema,
  boardSchema,
};

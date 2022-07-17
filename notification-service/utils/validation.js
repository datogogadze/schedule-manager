const Joi = require('joi');

const loginSchema = Joi.object({
  user_id: Joi.string().guid().required(),
  device_token: Joi.string().required(),
  session_expires: Joi.number().required().strict(),
});

const logoutSchema = Joi.object({
  user_id: Joi.string().guid().required(),
  device_token: Joi.string().required(),
});

module.exports = { loginSchema, logoutSchema };

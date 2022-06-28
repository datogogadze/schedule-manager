const Joi = require('joi');
const { Role } = require('./enums');

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

const oAuthSchema = Joi.object({
  email: Joi.string().email().min(8).max(254).lowercase().trim().required(),
  password: Joi.string().allow(null),
  profile: Joi.object({
    email: Joi.string().email().min(8).max(254).lowercase().trim().required(),
    name: Joi.string().min(8).max(128).required(),
    given_name: Joi.string().min(1).max(128).required(),
    family_name: Joi.string().min(1).max(128).required(),
    picture: Joi.string().min(8).max(256).allow(null),
    verified_email: Joi.boolean(),
    external_type: Joi.string().min(1).max(128).required(),
    id: Joi.string().min(8).max(128).required(),
  }).unknown(),
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
  role: Joi.string()
    .min(3)
    .max(254)
    .lowercase()
    .trim()
    .required()
    .custom((value, helpers) => {
      if (!Role.has(value)) {
        return helpers.message({ custom: 'Incorrect role' });
      }
      return value;
    }),
});

const boardAddUserSchema = Joi.object({
  code: Joi.string().length(6).trim().required(),
  role: Joi.string()
    .min(3)
    .max(254)
    .lowercase()
    .trim()
    .required()
    .custom((value, helpers) => {
      if (!Role.has(value)) {
        return helpers.message({ custom: 'Incorrect role' });
      }
      return value;
    }),
});

const boardRemoveUserSchema = Joi.object({
  user_id: Joi.string().guid().required(),
  board_id: Joi.string().guid().required(),
});

const boardUsersSchema = Joi.object({
  board_id: Joi.string().guid().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  passwordSchema,
  emailSchema,
  boardSchema,
  boardAddUserSchema,
  boardRemoveUserSchema,
  boardUsersSchema,
  oAuthSchema,
};

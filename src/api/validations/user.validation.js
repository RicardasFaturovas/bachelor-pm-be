const Joi = require('joi');
const User = require('../models/user.model');

module.exports = {

  // GET /v1/users
  listUsers: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      name: Joi.string(),
      email: Joi.string(),
      role: Joi.string().valid(User.roles),
    },
  },

  // POST /v1/users
  createUser: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(128).required(),
      name: Joi.string().max(128),
      role: Joi.string().valid(User.roles),
    },
  },

  // PUT /v1/users/:userId
  replaceUser: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(128).required(),
      name: Joi.string().max(128),
      role: Joi.string().valid(User.roles),
    },
    params: {
      userId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    },
  },

  // PATCH /v1/users/
  updateUser: {
    body: {
      email: Joi.string().email().optional(),
      name: Joi.string().required().max(128).optional(),
      lastName: Joi.string().required().max(128).optional(),
      location: Joi.string().optional(),
      phone: Joi.string().max(20).optional(),
      occupation: Joi.string().optional(),
    },
  },

  // PATCH /v1/users/update-password
  updateUserPassword: {
    body: {
      oldPassword: Joi.string().min(6).max(128).required(),
      newPassword: Joi.string().min(6).max(128).required(),
      confirmPassword: Joi.ref('newPassword'),
    },
  },
};

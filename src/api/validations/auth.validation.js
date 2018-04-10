const Joi = require('joi');

module.exports = {
  // POST /v1/auth/register
  register: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(128).required(),
      confirmPassword: Joi.ref('password'),
      name: Joi.string().required().max(128).required(),
      lastName: Joi.string().required().max(128).required(),
      birthYear: Joi.number().positive().optional(),
      gender: Joi.string().allow('male', 'female').required(),
      location: Joi.string().optional(),
      phone: Joi.string().max(20).required(),
      occupation: Joi.string().default(''),
    },
  },

  // POST /v1/auth/login
  login: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().required().max(128),
    },
  },

  // POST /v1/auth/facebook
  // POST /v1/auth/google
  oAuth: {
    body: {
      access_token: Joi.string().required(),
    },
  },

  // POST /v1/auth/refresh
  refresh: {
    body: {
      email: Joi.string().email().required(),
      refreshToken: Joi.string().required(),
    },
  },
};

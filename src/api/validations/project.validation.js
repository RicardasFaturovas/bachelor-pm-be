const Joi = require('joi');

module.exports = {
  // POST /v1/projects/create-project
  createProject: {
    body: {
      code: Joi.string().max(4).required(),
      name: Joi.string().max(128).required(),
      startDate: Joi.date().iso().optional(),
      users: Joi.array().items(Joi.string()).optional(),
      description: Joi.string().max(500).optional(),
    },
  },
  updateProject: {
    body: {
      name: Joi.string().max(128).optional(),
      startDate: Joi.date().iso(),
      users: Joi.array().items(Joi.string()).optional(),
      description: Joi.string().max(500).optional(),
    },
  },
  removeUser: {
    body: {
      user: Joi.string().required(),
    },
  },
};

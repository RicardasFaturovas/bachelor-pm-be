const Joi = require('joi');

module.exports = {
  // POST /v1/projects/create-project
  createProject: {
    body: {
      name: Joi.string().max(128).required(),
      startDate: Joi.date().iso(),
      users: Joi.array().items(Joi.object({
        _id: Joi.string(),
      })),
      description: Joi.string().max(500),
    },
  },
};

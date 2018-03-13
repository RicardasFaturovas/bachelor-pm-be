const Joi = require('joi');

module.exports = {
  // POST /v1/projects/create-project
  createProject: {
    body: {
      name: Joi.string().max(128).email().required(),
      startDate: Joi.date().iso(),
      users: Joi.array().items(Joi.object({
        _id: Joi.string(),
      })),
      creatorId: Joi.string().required(),
      description: Joi.string().max(500),
    },
  },
};

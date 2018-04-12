const Joi = require('joi');

module.exports = {
  // POST /v1/sprints/:projectId/create-sprints
  createSprints: {
    body: {
      sprintTime: Joi.object({
        days: Joi.number().required(),
      }).required(),
      sprintCount: Joi.number().required(),
    },
  },
  updateSprint: {
    body: {
      stories: Joi.array().items(Joi.string()).optional(),
      bugs: Joi.array().items(Joi.string()).optional(),
      state: Joi.string().allow('todo', 'inProgress', 'done').optional(),
    },
  },
};

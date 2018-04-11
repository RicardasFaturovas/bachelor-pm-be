const Joi = require('joi');

module.exports = {
  // POST /v1/tasks/:storyId/create-task
  createTask: {
    body: {
      name: Joi.string().max(500).required(),
      priority: Joi.string().allow('blocker', 'critical', 'major', 'medium', 'minor').required(),
      state: Joi.string().allow('todo', 'inProgress', 'testing', 'done').default('todo'),
      assignee: Joi.string().optional(),
      description: Joi.string().optional(),
      estimatedTime: Joi.object({
        hours: Joi.number().optional(),
        minutes: Joi.number().optional(),
        days: Joi.number().optional(),
      }).optional(),
    },
  },
};

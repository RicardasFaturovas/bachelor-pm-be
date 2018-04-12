const Joi = require('joi');

module.exports = {
  // POST /v1/bugs/:projectId/create-bug
  createBug: {
    body: {
      name: Joi.string().max(500).required(),
      priority: Joi.string().allow('blocker', 'critical', 'major', 'medium', 'minor').required(),
      state: Joi.string().allow('todo', 'inProgress', 'testing', 'done').default('todo'),
      assignee: Joi.string().optional(),
      description: Joi.string().optional(),
    },
  },
  // POST /v1/bugs/:projectName/:bugId/update-bug
  updateBug: {
    body: {
      name: Joi.string().max(500).optional(),
      priority: Joi.string().allow('blocker', 'critical', 'major', 'medium', 'minor').optional(),
      state: Joi.string().allow('todo', 'inProgress', 'testing', 'done').default('todo').optional(),
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

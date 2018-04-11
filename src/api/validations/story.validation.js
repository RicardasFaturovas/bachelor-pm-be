const Joi = require('joi');

module.exports = {
  // POST /v1/stories/:projectId/create-story
  createStory: {
    body: {
      code: Joi.string().required(),
      name: Joi.string().max(500).required(),
      storyPoints: Joi.string().allow('extraLarge', 'large', 'medium', 'small', 'extraSmall').required(),
      priority: Joi.string().allow('blocker', 'critical', 'major', 'medium', 'minor').required(),
      state: Joi.string().allow('todo', 'inProgress', 'testing', 'done').default('todo'),
      assignee: Joi.string().optional(),
      description: Joi.string().optional(),
    },
  },
  // POST /v1/stories/:projectName/:storyCode/update-story
  updateStory: {
    body: {
      name: Joi.string().max(500).optional(),
      storyPoints: Joi.string().allow('extraLarge', 'large', 'medium', 'small', 'extraSmall').optional(),
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

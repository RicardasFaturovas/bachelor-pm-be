const Joi = require('joi');

module.exports = {
  // POST /v1/stories/:projectName/create-story
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
};

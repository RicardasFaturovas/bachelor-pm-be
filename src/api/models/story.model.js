const mongoose = require('mongoose');
const timeSchema = require('./time.schema');
const { forEach, reject, isNil } = require('ramda');

/**
 * Story Schema
 * @private
 */
const states = ['todo', 'inProgress', 'testing', 'done'];
const priorities = ['blocker', 'critical', 'major', 'medium', 'minor'];


const storySchema = new mongoose.Schema({
  code: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    maxlength: 256,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    enum: states,
    required: true,
  },
  priority: {
    type: String,
    enum: priorities,
    required: true,
  },
  estimatedTime: timeSchema,
  loggedTime: timeSchema,
  sprint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint',
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  }],
}, {
  timestamps: true,
});

storySchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'code',
      'name',
      'description',
      'state',
      'priority',
      'estimatedTime',
      'loggedTime',
      'creator',
      'assigne',
      'createdAt',
      'tasks',
    ];

    forEach((field) => {
      transformed[field] = this[field];
    }, fields);

    return transformed;
  },
});

storySchema.statics = {
  /**
   * List stories in descending order of 'createdAt' timestamp.
   *
   * @returns {Promise<Story[]>}
   */
  list({
    creator, code,
  }) {
    const options = reject(isNil, { code, creator });

    return this.find(options)
      .populate('creator', ['name', 'lastname'])
      .populate('assignee', ['name', 'lastname'])
      .sort({ createdAt: -1 })
      .exec();
  },
};

/**
 * @typedef Story
 */
module.exports = mongoose.model('Story', storySchema);

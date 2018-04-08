const mongoose = require('mongoose');
const timeSchema = require('./time.schema').schema;
const { forEach, reject, isNil } = require('ramda');

/**
 * Story Schema
 * @private
 */
const states = ['todo', 'inProgress', 'testing', 'done'];
const priorities = ['blocker', 'critical', 'major', 'medium', 'minor'];
const storyPoints = ['extraLarge', 'large', 'medium', 'small', 'extraSmall'];

const storySchema = new mongoose.Schema({
  code: {
    type: String,
    index: true,
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
  storyPoints: {
    type: String,
    enum: storyPoints,
    required: true,
  },
  estimatedTime: timeSchema,
  loggedTime: timeSchema,
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
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
      'priority',
      'assignee',
      'creator',
    ];

    forEach((field) => {
      transformed[field] = this[field];
    }, fields);

    return transformed;
  },

  detailedTransform() {
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
      'assignee',
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
    project, code,
  }) {
    const options = reject(isNil, { code, project });

    return this.find(options)
      .populate('creatopr', ['id', 'name', 'lastname'])
      .sort({ createdAt: -1 })
      .exec();
  },
  /**
   *List stories in descending order of 'createdAt' timestamp with their details.
   *
   * @returns {Promise<Story[]>}
   */
  detailedView({
    project, code,
  }) {
    const options = reject(isNil, { code, project });

    return this.findOne(options)
      .populate('assignee', ['_id', 'name', 'lastname'])
      .populate('creator', ['_id', 'name', 'lastname'])
      // .populate('sprint', ['_id', 'indicator'])
      .sort({ createdAt: -1 })
      .exec();
  },
};

/**
 * @typedef Story
 */
module.exports = mongoose.model('Story', storySchema);

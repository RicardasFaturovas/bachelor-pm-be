const mongoose = require('mongoose');
const timeSchema = require('./time.schema').schema;
const { forEach, reject, isNil } = require('ramda');

/**
 * Task Schema
 * @private
 */
const states = ['todo', 'inProgress', 'done'];
const priorities = ['blocker', 'critical', 'major', 'medium', 'minor'];


const taskSchema = new mongoose.Schema({
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
  story: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

taskSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'name',
      'story',
      'description',
      'state',
      'priority',
      'estimatedTime',
      'loggedTime',
      'creator',
      'assignee',
      'createdAt',
    ];

    forEach((field) => {
      transformed[field] = this[field];
    }, fields);

    return transformed;
  },
});

taskSchema.statics = {
  /**
   * List tasks in descending order of 'createdAt' timestamp.
   *
   * @returns {Promise<Task[]>}
   */
  list({
    creator, code, storyCode,
  }) {
    const options = reject(isNil, {
      code,
      creator,
      story: {
        code: storyCode,
      },
    });

    return this.find(options)
      .populate('creator', ['name', 'lastname'])
      .populate('assignee', ['name', 'lastname'])
      .sort({ createdAt: -1 })
      .exec();
  },
};

/**
 * @typedef Task
 */
module.exports = mongoose.model('Task', taskSchema);

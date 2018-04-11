const mongoose = require('mongoose');
const { schema: timeSchema, formatTime } = require('./time.schema');
const { forEach, reject, isNil } = require('ramda');

/**
 * Task Schema
 * @private
 */
const states = ['todo', 'inProgress', 'done'];
const priorities = ['blocker', 'critical', 'major', 'medium', 'minor'];


const taskSchema = new mongoose.Schema({
  code: {
    type: String,
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

taskSchema.pre('save', function save(next) {
  try {
    if (this.loggedTime) {
      this.loggedTime = formatTime(this.loggedTime);
    }
    if (this.estimatedTime) {
      this.estimatedTime = formatTime(this.estimatedTime);
    }
    return next();
  } catch (error) {
    return next(error);
  }
});

taskSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'code',
      'name',
      'story',
      'state',
      'estimatedTime',
      'loggedTime',
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
  list({ story }) {
    const options = reject(isNil, { story });

    return this.find(options)
      .populate('creator', ['_id', 'name', 'lastname'])
      .populate('assignee', ['_id', 'name', 'lastname'])
      .sort({ createdAt: -1 })
      .exec();
  },
};

/**
 * @typedef Task
 */
module.exports = mongoose.model('Task', taskSchema);

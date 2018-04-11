const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { schema: timeSchema, formatTime } = require('./time.schema');
const { forEach, reject, isNil } = require('ramda');
const APIError = require('../utils/APIError');

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
      '_id',
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
   * Get story
   *
   * @param {String} id - The id of the story.
   * @returns {Promise<Story, APIError>}
   */
  async get(id) {
    try {
      let task;
      if (mongoose.Types.ObjectId.isValid(id)) {
        task = await this.findById(id)
          .populate('story', ['_id', 'code'])
          .exec();
      }

      if (task) {
        return task;
      }

      throw new APIError({
        message: 'Task does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

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

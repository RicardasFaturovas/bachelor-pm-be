const mongoose = require('mongoose');
const timeSchema = require('./time.schema');
const httpStatus = require('http-status');
const { forEach, reject, isNil } = require('ramda');
const APIError = require('../utils/APIError');

/**
 * Bug Schema
 * @private
 */
const states = ['todo', 'inProgress', 'testing', 'done'];
const priorities = ['blocker', 'critical', 'major', 'medium', 'minor'];


const bugSchema = new mongoose.Schema({
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
}, {
  timestamps: true,
});

bugSchema.method({
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
    ];

    forEach((field) => {
      transformed[field] = this[field];
    }, fields);

    return transformed;
  },
});

bugSchema.statics = {
  /**
   * List bug in descending order of 'createdAt' timestamp.
   *
   * @returns {Promise<Bug[]>}
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

  async scrumboardList(id) {
    try {
      let stories;
      if (mongoose.Types.ObjectId.isValid(id)) {
        stories = await this.find({
          sprint: id,
        })
          .populate('assignee', ['_id', 'name', 'lastname'])
          .populate('creator', ['_id', 'name', 'lastname'])
          .populate('sprint', ['_id', 'indicator'])
          .exec();
      }

      if (stories.length) {
        return stories;
      }

      throw new APIError({
        message: 'Specified sprint does not have any stories or is not a valid sprint',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get bug
   *
   * @param {String} bug - The id of the bug.
   * @returns {Promise<Bug, APIError>}
   */
  async get(id) {
    try {
      let bug;

      if (mongoose.Types.ObjectId.isValid(id)) {
        bug = await this.findById(id)
          .exec();
      }

      if (bug) {
        return bug;
      }

      throw new APIError({
        message: 'Story does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },
};

/**
 * @typedef Bug
 */
module.exports = mongoose.model('Bug', bugSchema);

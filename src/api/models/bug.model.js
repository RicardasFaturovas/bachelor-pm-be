const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { forEach, reject, isNil } = require('ramda');

const { schema: timeSchema, formatTime } = require('./time.schema');
const APIError = require('../utils/APIError');

/**
 * Bug Schema
 * @private
 */
const states = ['todo', 'inProgress', 'testing', 'done'];
const priorities = ['blocker', 'critical', 'major', 'medium', 'minor'];
const storyPoints = ['extraLarge', 'large', 'medium', 'small', 'extraSmall', 'extraExtraSmall'];

const bugSchema = new mongoose.Schema({
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
  bugPoints: {
    type: String,
    enum: storyPoints,
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
      '_id',
      'code',
      'name',
      'description',
      'state',
      'priority',
      'sprint',
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

bugSchema.pre('save', function save(next) {
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

  async scrumboardList(id, assignee) {
    try {
      let bugs;
      if (mongoose.Types.ObjectId.isValid(id)) {
        bugs = await this.find({
          $and: [
            { sprint: id },
            { assignee: !assignee ? { $exists: true } : assignee },
          ],
        })
          .populate('assignee', ['_id', 'name', 'lastname'])
          .populate('creator', ['_id', 'name', 'lastname'])
          .populate('sprint', ['_id', 'indicator'])
          .exec();
      }

      if (bugs.length) {
        return bugs;
      }

      throw new APIError({
        message: 'Specified sprint does not have any bugs or is not a valid sprint',
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
        message: 'Bug does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get multiple bugs by ids
   *
   * @param {String[]} idArray - An array of ids of the bugs.
   * @returns {Promise<Bug[], APIError>}
   */
  async getMultipleById(idArray) {
    try {
      const bugs = await this.find({
        _id: {
          $in: idArray,
        },
      }).exec();

      if (bugs.length) {
        return bugs;
      }

      return null;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get multiple bugs by ids
   *
   * @param {String[]} idArray - An array of ids of the bugs.
   * @returns {Promise<Story[], APIError>}
   */
  async getMultipleNotDoneById(idArray) {
    try {
      const bugs = await this.find({
        $and: [
          {
            _id: {
              $in: idArray,
            },
          },
          {
            state: {
              $ne: 'done',
            },
          },
        ],
      }).exec();

      if (bugs.length) {
        return bugs;
      }

      return null;
    } catch (error) {
      throw error;
    }
  },


  /**
   * Get the bug summary
   *
   * @returns {Promise<Bug[]>}
   */
  async detailedView(id) {
    try {
      let bug;

      if (mongoose.Types.ObjectId.isValid(id)) {
        bug = await this.findById(id)
        .populate('assignee', ['_id', 'name', 'lastname'])
        .populate('creator', ['_id', 'name', 'lastname'])
        .populate('sprint', ['_id', 'indicator'])
        .exec();
      }

      if (bug) {
        return bug;
      }
      throw new APIError({
        message: 'Bug does not exist',
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

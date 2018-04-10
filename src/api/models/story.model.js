const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { schema: timeSchema, formatTime } = require('./time.schema');
const { forEach, reject, isNil } = require('ramda');
const APIError = require('../utils/APIError');
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
      'id',
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
      '_id',
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

storySchema.pre('save', function save(next) {
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
      .populate('creator', ['id', 'name', 'lastname'])
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

  /**
   * Get story
   *
   * @param {String} project - The id of the project.
   * @param {String} code - The code of the story.
   * @returns {Promise<Project, APIError>}
   */
  async get(project, code) {
    try {
      const story = await this.findOne({
        $and: [
          { project },
          { code },
        ],
      }).exec();

      if (story) {
        return story;
      }

      throw new APIError({
        message: 'Story does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get story
   *
   * @param {String[]} idArray - An array of ids of the project.
   * @returns {Promise<Story[], APIError>}
   */
  async getMultipleById(idArray) {
    try {
      const stories = await this.find({
        _id: {
          $in: idArray,
        },
      }).exec();

      if (stories.length) {
        return stories;
      }

      return null;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get story by id
   *
   * @param {ObjectId} id - The objectId of story.
   * @returns {Promise<Story, APIError>}
   */
  async getIfExists(id) {
    try {
      let story;

      if (mongoose.Types.ObjectId.isValid(id)) {
        story = await this.findById(id)
          .exec();
      }
      if (story) {
        return story;
      }
      return null;
    } catch (error) {
      throw error;
    }
  },
};

/**
 * @typedef Story
 */
module.exports = mongoose.model('Story', storySchema);

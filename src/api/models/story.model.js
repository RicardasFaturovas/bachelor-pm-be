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
      'sprint',
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

storySchema.pre('remove', function remove(next) {
  this.model('Task').remove({ story: this._id }, next);
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
  detailedView(id) {
    return this.findById(id)
      .populate('assignee', ['_id', 'name', 'lastname'])
      .populate('creator', ['_id', 'name', 'lastname'])
      .populate('sprint', ['_id', 'indicator'])
      .populate('tasks', ['_id', 'name', 'code', 'assignee', 'status'])
      .exec();
  },

  /**
   * Get story
   *
   * @param {String} id - The id of the story.
   * @returns {Promise<Story, APIError>}
   */
  async get(id) {
    try {
      let story;

      if (mongoose.Types.ObjectId.isValid(id)) {
        story = await this.findById(id)
          .populate('tasks', ['_id', 'code'])
          .exec();
      }

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
   * Get story list for scrumboard
   *
   * @param {String} id - Id of the sprint to search by
   * @returns {Promise<Story[], APIError>}
   */
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
          .populate('tasks', ['_id', 'name', 'code', 'assignee', 'status'])
          .populate({
            path: 'tasks',
            select: ['_id', 'name', 'code', 'assignee', 'status'],
            populate: {
              path: 'assignee',
              select: ['_id', 'name', 'lastName'],
              model: 'User',
            },
          })
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
   * Get story
   *
   * @param {Sring} id - Id of the task to look for in story
   * @returns {Promise<Story[], APIError>}
   */
  async getByTaskId(id) {
    try {
      let story;
      if (mongoose.Types.ObjectId.isValid(id)) {
        story = await this.findOne({
          tasks: {
            $in: [id],
          },
        });
      }

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

const mongoose = require('mongoose');
const {
  forEach,
  reject,
  isNil,
  map,
  pipe,
  concat,
} = require('ramda');
const httpStatus = require('http-status');

const { calculateTime } = require('./time.schema');
const { storyPointsSizeSchema } = require('./storyPoints.schema');
const APIError = require('../utils/APIError');


/**
 * Story Schema
 * @private
 */
const allowedTime = [2, 4, 5, 10, 20];
const states = ['todo', 'inProgress', 'done'];

const sprintSchema = new mongoose.Schema({
  indicator: {
    type: Number,
    required: true,
  },
  time: {
    days: {
      type: Number,
      enum: allowedTime,
      required: true,
    },
  },
  state: {
    type: String,
    enum: states,
    required: true,
  },
  sprintStartDate: {
    type: Date,
  },
  remainingSize: storyPointsSizeSchema,
  idealSize: storyPointsSizeSchema,
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  stories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
  }],
  bugs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bug',
  }],
}, {
  timestamps: true,
});

sprintSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'id',
      'indicator',
      'time',
      'state',
      'stories',
      'sprintStartDate',
    ];

    forEach((field) => {
      transformed[field] = this[field];
    }, fields);
    transformed.period = {
      startTime: this.time.days * this.indicator,
      endTime: this.time.days * (this.indicator + 1),
    };
    transformed.chartData = {
      totalStoryAndBugEstimatedTime: this.stories.length ?
        pipe(
          concat,
          map(el => el.estimatedTime),
          calculateTime,
        )(this.stories, this.bugs) : null,
      totalStoryAndBugLoggedTime: this.stories.length ?
        pipe(
          concat,
          map(story => story.loggedTime),
          calculateTime,
        )(this.stories, this.bugs) : null,
    };

    return transformed;
  },

  transformBurndownData() {
    const transformed = {};
    const fields = [
      'id',
      'indicator',
      'time',
      'state',
      'sprintStartDate',
    ];

    forEach((field) => {
      transformed[field] = this[field];
    }, fields);
    transformed.period = {
      startTime: this.time.days * this.indicator,
      endTime: this.time.days * (this.indicator + 1),
    };

    transformed.remainingSize = reject((el => typeof el !== 'number'), this.remainingSize);
    transformed.idealSize = reject((el => typeof el !== 'number'), this.idealSize);

    return transformed;
  },
});

sprintSchema.statics = {
  /**
   * Get sprint by id.
   *
   * @returns {Promise<Sprint>}
   */
  getOne(id) {
    return this.findById(id)
      .populate('stories', ['state', 'loggedTime', 'estimatedTime', 'storyPoints'])
      .populate('bugs', ['state', 'loggedTime', 'estimatedTime', 'bugPoints'])
      .exec();
  },

  /**
   * List Sprint in descending order of 'indicator'.
   *
   * @returns {Promise<Sprint[]>}
   */
  list({ project }) {
    const options = reject(isNil, { project });

    return this.find(options)
      .populate('stories', ['state', 'loggedTime', 'estimatedTime', 'name', 'code'])
      .populate('bugs', ['state', 'loggedTime', 'estimatedTime', 'name', 'code'])
      .sort({ indicator: -1 })
      .exec();
  },

  /**
   * Find latest sprint otherwise return null
   *
   * @returns {Promise<User, APIError>}
   */
  async findLatest(project) {
    try {
      const sprint = await this.find({ project })
        .sort({ indicator: -1 })
        .limit(1)
        .exec();

      if (sprint) {
        return sprint;
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get sprint
   *
   * @param {String} project - The id of the project.
   * @param {String} indicator - The sprint indicator.
   * @returns {Promise<Sprint, APIError>}
   */
  async get(project, indicator) {
    try {
      const sprint = await this.findOne({
        $and: [
          { project },
          { indicator },
        ],
      })
        .populate({
          path: 'stories',
          select: [
            'name',
            'code',
            'assignee',
            'priority',
            'state',
            'loggedTime',
            'estimatedTime',
            'storyPoints',
          ],
          populate: {
            path: 'assignee',
            select: ['_id', 'name', 'lastName'],
            model: 'User',
          },
        })
        .populate({
          path: 'bugs',
          select: [
            'name',
            'code',
            'assignee',
            'priority',
            'state',
            'loggedTime',
            'estimatedTime',
            'bugPoints',
          ],
          populate: {
            path: 'assignee',
            select: ['_id', 'name', 'lastName'],
            model: 'User',
          },
        })
        .exec();

      if (sprint) {
        return sprint;
      }

      throw new APIError({
        message: 'Sprint does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get sprint by story id
   *
   * @param {String} story - The id of the story.
   * @returns {Promise<Sprint, APIError>}
   */
  async getByStory(story) {
    try {
      const sprint = await this.findOne({
        stories: {
          $in: [story],
        },
      }).exec();

      if (sprint) {
        return sprint;
      }

      throw new APIError({
        message: 'Sprint does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },
};

/**
 * @typedef Sprint
 */
module.exports = mongoose.model('Sprint', sprintSchema);

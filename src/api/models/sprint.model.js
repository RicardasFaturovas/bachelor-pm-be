const mongoose = require('mongoose');
const {
  forEach,
  reject,
  isNil,
  map,
  pipe,
  reduce,
} = require('ramda');
const APIError = require('../utils/APIError');
const httpStatus = require('http-status');
const { formatTime } = require('./time.schema');


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
}, {
  timestamps: true,
});

const calculateTime = (timeArr) => {
  if (timeArr.length && !timeArr.includes(undefined)) {
    return pipe(
      reduce((acc, val) => ({
        days: acc.days + val.days,
        hours: acc.hours + val.hours,
        minutes: acc.minutes + val.minutes,
      }), { days: 0, hours: 0, minutes: 0 }),
      formatTime,
    )(timeArr);
  }
  return { days: 0, hours: 0, minutes: 0 };
};

sprintSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'id',
      'indicator',
      'time',
      'state',
      'creator',
      'project',
      'assigne',
      'createdAt',
      'stories',
    ];

    forEach((field) => {
      transformed[field] = this[field];
    }, fields);
    transformed.period = {
      startTime: this.time.days * this.indicator,
      endTime: this.time.days * (this.indicator + 1),
    };
    transformed.chartData = {
      totalStoryEstimatedTime: this.stories.length ?
        pipe(
          map(story => story.estimatedTime),
          calculateTime,
        )(this.stories) : null,
      totalStoryLoggedTime: this.stories.length ?
        pipe(
          map(story => story.loggedTime),
          calculateTime,
        )(this.stories) : null,
    };

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
      .populate('stories', ['state', 'loggedTime', 'estimatedTime'])
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
      .populate('stories', ['state', 'loggedTime', 'estimatedTime'])
      .sort({ indicator: -1 })
      .exec();
  },

  /**
   * Find latest sprint otherwise return null
   *
   * @returns {Promise<User, APIError>}
   */
  async findLatest() {
    try {
      const sprint = await this.findOne()
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
   * @returns {Promise<Project, APIError>}
   */
  async get(project, indicator) {
    try {
      const sprint = await this.findOne({
        $and: [
          { project },
          { indicator },
        ],
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

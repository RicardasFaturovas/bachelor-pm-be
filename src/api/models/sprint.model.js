const mongoose = require('mongoose');
const { forEach, reject, isNil } = require('ramda');

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

sprintSchema.method({
  transform() {
    const transformed = {};
    const fields = [
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
      transformed.period = {
        startTime: this.time.days * this.indicator,
        endTime: this.time.days * (this.indicator + 1),
      };
    }, fields);

    return transformed;
  },
});

sprintSchema.statics = {
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

};

/**
 * @typedef Sprint
 */
module.exports = mongoose.model('Sprint', sprintSchema);

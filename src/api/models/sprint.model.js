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
      'assigne',
      'createdAt',
      'stories',
    ];

    forEach((field) => {
      transformed[field] = this[field];
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
  summaryList({ projectId, indicator }) {
    const options = reject(isNil, { projectId, indicator });

    return this.find(options)
      .populate('stories', ['status, loggedTime', 'estimatedTime'])
      .sort({ indicator: -1 })
      .exec();
  },
};

/**
 * @typedef Sprint
 */
module.exports = mongoose.model('Sprint', sprintSchema);

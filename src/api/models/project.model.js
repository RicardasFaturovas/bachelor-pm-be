const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const httpStatus = require('http-status');
const { forEach, reject, isNil } = require('ramda');
/**
 * Project Schema
 * @private
 */
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 128,
    unique: true,
    index: true,
    trim: true,
  },
  startDate: {
    type: Date,
    default: Date.now(),
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true,
  },
  picture: {
    type: String,
    trim: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  sprints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint',
  }],
  stories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
  }],
}, {
  timestamps: true,
});

projectSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'name',
      'description',
      'startDate',
      'picture',
      'createdAt',
      'creator',
      'users',
      'sprints',
      'stories',
    ];

    forEach((field) => {
      transformed[field] = this[field];
    }, fields);

    return transformed;
  },
});

projectSchema.statics = {
  /**
   * List projects in descending order of 'createdAt' timestamp.
   *
   * @returns {Promise<Project[]>}
   */
  list({ creatorId, name }) {
    const options = reject(isNil, { name, creatorId });

    return this.find(options)
      // .populate('stories', ['status'])
      // .populate('sprints', ['indicator'])
      .sort({ createdAt: -1 })
      .exec();
  },

  /**
   * Get project
   *
   * @param {String} name - The name of the project.
   * @param {String} creator - The creator of the project.
   * @returns {Promise<Project, APIError>}
   */
  async get(name, creator) {
    try {
      const project = await this.findOne({
        $and: [
          { name },
          { creator },
        ],
      }).exec();

      if (project) {
        return project;
      }

      throw new APIError({
        message: 'Project does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },
};

/**
 * @typedef Project
 */
module.exports = mongoose.model('Project', projectSchema);

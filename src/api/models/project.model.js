const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { forEach, reject, isNil } = require('ramda');

const APIError = require('../utils/APIError');
/**
 * Project Schema
 * @private
 */
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 128,
    trim: true,
    unique: true,
  },
  code: {
    type: String,
    maxlength: 4,
    trim: true,
    unique: true,
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
  bugs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bug',
  }],
}, {
  timestamps: true,
});

projectSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'id',
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

  summaryTransform() {
    const transformed = {};
    const fields = [
      'id',
      'name',
      'description',
      'stories',
    ];

    forEach((field) => {
      transformed[field] = this[field];
    }, fields);

    transformed.sprints = this.sprints.length;
    return transformed;
  },
});

projectSchema.statics = {
  /**
   * List projects in descending order of 'createdAt' timestamp.
   *
   * @returns {Promise<Project[]>}
   */
  list({ creator }) {
    const options = reject(isNil, { creator });

    return this.find(options)
      .populate('stories', ['state'])
      .populate('sprints', ['indicator'])
      .sort({ createdAt: -1 })
      .exec();
  },

  /**
   * Get project by id.
   *
   * @returns {Promise<Project>}
   */
  getOne(id) {
    return this.findById(id)
      .populate('users', ['_id', 'name', 'lastName'])
      .populate('creator', ['_id', 'name', 'lastName'])
      .exec();
  },

  /**
   * Get project
   *
   * @param {String} id - The id of the project.
   * @returns {Promise<Project, APIError>}
   */
  async get(id) {
    try {
      let project;

      if (mongoose.Types.ObjectId.isValid(id)) {
        project = await this.findById(id)
          .populate('stories', ['id', 'code'])
          .populate('bugs', ['id', 'code'])
          .exec();
      }
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

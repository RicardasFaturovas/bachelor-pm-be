const mongoose = require('mongoose');
const R = require('ramda');
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
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
      'creatorId',
      'users',
    ];

    R.forEach((field) => {
      transformed[field] = this[field];
    }, fields);

    return transformed;
  },
});

projectSchema.statics = {
  /**
   * List projects in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of projects to be skipped.
   * @param {number} limit - Limit number of projects to be returned.
   * @returns {Promise<Project[]>}
   */
  list({
    page = 1, perPage = 30, creatorId, name,
  }) {
    const options = R.reject(R.isNil, { name, creatorId });

    return this.find(options)
      .populate('creatorId', '_id')
      .populate('users', '_id')
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
};

/**
 * @typedef Project
 */
module.exports = mongoose.model('Project', projectSchema);

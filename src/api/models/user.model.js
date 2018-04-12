const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { reject, isNil } = require('ramda');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const uuidv4 = require('uuid/v4');
const APIError = require('../utils/APIError');
const { env, jwtSecret, jwtExpirationInterval } = require('../../config/vars');

/**
* User Roles
*/
const roles = ['user', 'admin'];
const genders = ['male', 'female'];

/**
 * User Schema
 * @private
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 128,
  },
  name: {
    type: String,
    maxlength: 128,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    maxlength: 128,
    required: true,
    trim: true,
  },
  birthYear: {
    type: Number,
    maxlength: 4,
    trim: true,
  },
  occupation: {
    type: String,
    maxlength: 128,
    trim: true,
  },
  gender: {
    type: String,
    enum: genders,
    trim: true,
  },
  phone: {
    type: String,
    maxlength: 20,
    trim: true,
  },
  role: {
    type: String,
    enum: roles,
  },
  services: {
    facebook: String,
    google: String,
  },
  location: {
    type: String,
    trim: true,
  },
  picture: {
    type: String,
    trim: true,
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  }],
}, {
  timestamps: true,
});

userSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) return next();

    const rounds = env === 'test' ? 1 : 10;

    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
userSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      'id',
      'name',
      'lastname',
      'email',
      'picture',
      'location',
      'occupation',
      'createdAt',
      'birthYear',
      'phone',
      'gender',
    ];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  token() {
    const playload = {
      exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
      iat: moment().unix(),
      sub: this._id,
    };
    return jwt.encode(playload, jwtSecret);
  },

  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  },
});

/**
 * Statics
 */
userSchema.statics = {

  roles,

  /**
   * Get user
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    try {
      let user;

      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await this.findById(id)
          .populate('projects', '_id')
          .exec();
      }
      if (user) {
        return user;
      }

      throw new APIError({
        message: 'User does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get story
   *
   * @param {String[]} idArray - An array of user ids.
   * @returns {Promise<User[]>}
   */
  async getMultipleById(idArray) {
    try {
      const users = await this.find({
        _id: {
          $in: idArray,
        },
      }).exec();

      if (users.length) {
        return users;
      }

      return null;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user otherwise return null
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async getIfExists(id) {
    try {
      let user;

      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await this.findById(id)
          .populate('projects', '_id')
          .exec();
      }
      if (user) {
        return user;
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if passwords match
   *
   * @param {User} user - The request user object.
   * @param {string} oldPassword - The old user password.
   * @param {string} newPassword - The new user password.
   * @returns {Promise<string, APIError>}
   */
  async hashNewPassword(user, oldPassword, newPassword) {
    const rounds = env === 'test' ? 1 : 10;
    if (await user.passwordMatches(oldPassword)) {
      const hash = await bcrypt.hash(newPassword, rounds);
      return hash;
    }
    throw new APIError({
      message: 'Old password is incorrect',
      status: httpStatus.UNAUTHORIZED,
    });
  },

  /**
   * Find user by email and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async findAndGenerateToken(options) {
    const { email, password, refreshObject } = options;
    if (!email) throw new APIError({ message: 'An email is required to generate a token' });

    const user = await this.findOne({ email }).exec();
    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    };
    if (password) {
      if (user && await user.passwordMatches(password)) {
        return { user, accessToken: user.token() };
      }
      err.message = 'Incorrect email or password';
    } else if (refreshObject && refreshObject.userEmail === email) {
      return { user, accessToken: user.token() };
    } else {
      err.message = 'Incorrect email or refreshToken';
    }
    throw new APIError(err);
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({
    page = 1, perPage = 30, name, email, role,
  }) {
    const options = reject(isNil, { name, email, role });

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateEmail(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [{
          field: 'email',
          location: 'body',
          messages: ['"email" already exists'],
        }],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  },

  async oAuthLogin({
    service, id, email, name, picture,
  }) {
    const user = await this.findOne({ $or: [{ [`services.${service}`]: id }, { email }] });
    if (user) {
      user.services[service] = id;
      if (!user.name) user.name = name;
      if (!user.picture) user.picture = picture;
      return user.save();
    }
    const password = uuidv4();
    return this.create({
      services: { [service]: id }, email, password, name, picture,
    });
  },
};

/**
 * @typedef User
 */
module.exports = mongoose.model('User', userSchema);

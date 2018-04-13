const httpStatus = require('http-status');
const { omit, map } = require('ramda');
const User = require('../models/user.model');
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const user = await User.get(id);
    req.locals = { user };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get user
 * @public
 */
exports.get = (req, res) => res.json(req.locals.user.transform());

/**
 * Get logged in user info
 * @public
 */
exports.loggedIn = async (req, res, next) => {
  try {
    const user = await User.get(req.user.id);
    res.json(user.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Get users by email
 * @public
 */
exports.getUsersByEmail = async (req, res, next) => {
  try {
    const users = await User.findByEmailSubstring(req.body.email);
    res.json(map(user => user.getEmailInfo(), users));
  } catch (error) {
    next(error);
  }
};


/**
 * Create new user
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(httpStatus.CREATED);
    res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/**
 * Replace existing user
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    const { user } = req.locals;
    const newUser = new User(req.body);
    const ommitRole = user.role !== 'admin' ? 'role' : '';
    const newUserObject = omit(['_id', ommitRole], newUser.toObject());

    await user.update(newUserObject, { override: true, upsert: true });
    const savedUser = await User.findById(user._id);

    res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/**
 * Update existing user
 * @public
 */
exports.update = async (req, res, next) => {
  try {
    const user = await User.get(req.user.id);
    const updatedUser = Object.assign(user, req.body);

    const savedUser = await updatedUser.save();
    res.json(savedUser.transform());
  } catch (e) {
    next(e);
  }
};

/**
 * Update existing user's passcode
 * @public
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.get(req.user._id);
    await User.checkOldPassword(user, req.body.oldPassword);
    user.password = req.body.newPassword;

    const savedUser = await user.save();
    res.json({ success: !!savedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const users = await User.list(req.query);
    const transformedUsers = users.map(user => user.transform());
    res.json(transformedUsers);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @public
 */
exports.remove = (req, res, next) => {
  const { user } = req.locals;

  user.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e));
};

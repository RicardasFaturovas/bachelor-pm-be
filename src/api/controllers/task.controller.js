const httpStatus = require('http-status');
const {
  append,
  merge,
  map,
  propEq,
  find,
} = require('ramda');
const APIError = require('../utils/APIError');
const User = require('../models/user.model');
const Story = require('../models/story.model');
const Task = require('../models/task.model');

/**
 * Create new task
 * @public
 */
exports.createTask = async (req, res, next) => {
  try {
    const { _id: creator } = req.user;
    const story = await Story.get(req.params.storyId);

    const { _id } = story;
    let assignee = await User.getIfExists(req.body.assignee);

    if (!assignee) assignee = req.user;

    const task = new Task(merge(req.body, {
      creator,
      story: _id,
      assignee: assignee._id,
    }));

    if (find(propEq('code', task.code))(story.tasks)) {
      throw new APIError({
        message: 'A task with that code already exists within the project',
        status: httpStatus.BAD_REQUEST,
      });
    }

    const savedTask = await task.save();

    story.tasks = append(task._id, story.tasks);
    await story.save();

    res.status(httpStatus.CREATED);
    res.json(savedTask.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Get task list
 * @public
 */
exports.getTaskList = async (req, res, next) => {
  try {
    const tasks = await Task.list({ story: req.params.storyId });
    const transformedTasks = map(task => task.transform(), tasks);
    res.json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

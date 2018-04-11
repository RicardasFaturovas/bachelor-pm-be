const httpStatus = require('http-status');
const {
  append,
  merge,
  map,
  takeLast,
  takeWhile,
} = require('ramda');
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

    const lastTaskCode = story.tasks.length ?
      Math.max(...map(task => takeLast(4, task.code), story.tasks)) :
      '';
    const code = `${takeWhile(x => x !== '-', story.code)}-T${(lastTaskCode + 1)
      .toString()
      .padStart(4, '0')}`;

    const task = new Task(merge(req.body, {
      code,
      creator,
      story: _id,
      assignee: assignee._id,
    }));

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

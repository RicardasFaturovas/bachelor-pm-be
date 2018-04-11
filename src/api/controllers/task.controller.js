const httpStatus = require('http-status');
const {
  append,
  add,
  merge,
  mergeWith,
  map,
  takeLast,
  takeWhile,
  omit,
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

/**
 * Update existing story
 * @public
 */
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.get(req.params.taskId);

    let assignee = await User.getIfExists(req.body.assignee);
    if (!assignee) assignee = req.user;
    task.assignee = assignee._id;

    if (req.body.loggedTime) {
      task.loggedTime = mergeWith(
        add,
        task.loggedTime,
        req.body.loggedTime,
      );

      const story = await Story.getByTaskId(req.params.taskId);
      story.loggedTime = mergeWith(
        add,
        story.loggedTime,
        task.loggedTime,
      );
      await story.save();
    }
    const updatedTask = Object.assign(task, omit(['assignee', 'loggedTime'], req.body));

    const savedTask = await updatedTask.save();
    res.json(savedTask.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Remove task
 * @public
 */
exports.removeTask = async (req, res, next) => {
  try {
    const task = await Task.get(req.params.taskId);
    const removedTask = task.remove();
    removedTask
      .then(() => res.status(httpStatus.NO_CONTENT).end());
  } catch (error) {
    next(error);
  }
};

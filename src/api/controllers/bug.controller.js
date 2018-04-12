const httpStatus = require('http-status');
const {
  append,
  merge,
  map,
  omit,
  takeLast,
  filter,
} = require('ramda');
const User = require('../models/user.model');
const Project = require('../models/project.model');
const Bug = require('../models/story.model');
/* TODO -- FINISH THIS BIT */
/**
 * Create new bug
 * @public
 */
exports.createBug = async (req, res, next) => {
  try {
    const { _id: creator } = req.user;
    const project = await Project.get(req.params.projectId);
    const { _id } = project;
    let assignee = await User.getIfExists(req.body.assignee);

    if (!assignee) assignee = req.user;

    const lastBugCode = project.bugs.length ?
      Math.max(...map(story => takeLast(4, story.code), project.stories)) :
      '';
    const code = `${project.code}-B${(lastBugCode + 1).toString().padStart(4, '0')}`;

    const bug = new Bug(merge(req.body, {
      code,
      creator,
      project: _id,
      assignee: assignee._id,
    }));

    project.bugs = append(bug._id, project.bugs);
    await project.save();
    const savedBug = await bug.save();

    res.status(httpStatus.CREATED);
    res.json(savedBug.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Get bug list
 * @public
 */
exports.getBugList = async (req, res, next) => {
  try {
    const currentProject = await Project.get(req.params.projectId);
    const { _id: project } = currentProject;
    const bugs = await Bug.list({ project });
    const transformedBugs = map(bug => bug.transform(), bugs);
    res.json(transformedBugs);
  } catch (error) {
    next(error);
  }
};

/**
 * Get story list with tasks by sprint
 * @public
 */
exports.getScrumboardBugData = async (req, res, next) => {
  try {
    const bugs = await Bug.scrumboardList(req.params.sprintId);
    const transformedBugs = map(story => story.detailedTransform(), bugs);
    const filteredStories = req.query.assigneeId ?
      map(story => Object.assign(story, {
        tasks: filter(task =>
          task.assignee._id.toString() === req.query.assigneeId, story.tasks),
      }), transformedBugs) :
      transformedBugs;
    res.json(filteredStories);
  } catch (error) {
    next(error);
  }
};

/**
 * Get story summary details
 * @public
 */
exports.getStorySummary = async (req, res, next) => {
  try {
    const story = await Bug.detailedView(req.params.storyId);
    const transformedStory = story.detailedTransform();
    res.json(transformedStory);
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing story
 * @public
 */
exports.updateStory = async (req, res, next) => {
  try {
    const story = await Bug.get(req.params.storyId);

    let assignee = await User.getIfExists(req.body.assignee);
    if (!assignee) assignee = req.user;
    story.assignee = assignee._id;
    const updatedStory = Object.assign(story, omit(['assignee'], req.body));

    const savedStory = await updatedStory.save();
    res.json(savedStory.detailedTransform());
  } catch (error) {
    next(error);
  }
};

/**
 * Delete story
 * @public
 */
exports.removeStory = async (req, res, next) => {
  try {
    const story = await Bug.get(req.params.storyId);
    const removedStory = story.remove();
    removedStory
      .then(() => res.status(httpStatus.NO_CONTENT).end());
  } catch (error) {
    next(error);
  }
};

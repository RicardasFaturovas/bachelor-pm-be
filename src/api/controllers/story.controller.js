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
const Story = require('../models/story.model');

/**
 * Create new story
 * @public
 */
exports.createStory = async (req, res, next) => {
  try {
    const { _id: creator } = req.user;
    const project = await Project.get(req.params.projectId);
    const { _id } = project;
    let assignee = await User.getIfExists(req.body.assignee);

    if (!assignee) assignee = req.user;

    const lastStoryCode = project.stories.length ?
      Math.max(...map(story => takeLast(4, story.code), project.stories)) :
      '';
    const code = `${project.code}-${(lastStoryCode + 1).toString().padStart(4, '0')}`;

    const story = new Story(merge(req.body, {
      code,
      creator,
      project: _id,
      assignee: assignee._id,
    }));

    project.stories = append(story._id, project.stories);
    await project.save();
    const savedStory = await story.save();

    res.status(httpStatus.CREATED);
    res.json(savedStory.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Get story list
 * @public
 */
exports.getStoryList = async (req, res, next) => {
  try {
    const currentProject = await Project.get(req.params.projectId);
    const { _id: project } = currentProject;
    const stories = await Story.list({ project });
    const transformedStories = map(story => story.transform(), stories);
    res.json(transformedStories);
  } catch (error) {
    next(error);
  }
};

/**
 * Get story list with tasks by sprint
 * @public
 */
exports.getScrumboardData = async (req, res, next) => {
  try {
    const stories = await Story.scrumboardList(req.params.sprintId);
    const transformedStories = map(story => story.detailedTransform(), stories);
    const filteredStories = req.query.assigneeId ?
      map(story => Object.assign(story, {
        tasks: filter(task =>
          task.assignee._id.toString() === req.query.assigneeId, story.tasks),
      }), transformedStories) :
      transformedStories;
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
    const story = await Story.detailedView(req.params.storyId);
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
    const story = await Story.get(req.params.storyId);

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
    const story = await Story.get(req.params.storyId);
    const removedStory = story.remove();
    removedStory
      .then(() => res.status(httpStatus.NO_CONTENT).end());
  } catch (error) {
    next(error);
  }
};

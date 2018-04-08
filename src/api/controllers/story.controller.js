const httpStatus = require('http-status');
const { append, merge, map } = require('ramda');
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
    const project = await Project.get(req.params.projectName, creator);
    const { _id } = project;
    let assignee = await User.getIfExists(req.body.assignee);

    if (!assignee) assignee = req.user;

    const story = new Story(merge(req.body, {
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
    const { _id: creator } = req.user;
    const currentProject = await Project.get(req.params.projectName, creator);
    const { _id: project } = currentProject;
    const stories = await Story.list({ creator, project });
    const transformedStories = map(story => story.transform(), stories);
    res.json(transformedStories);
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
    const { _id: creator } = req.user;
    const currentProject = await Project.get(req.params.projectName, creator);
    const { _id: project } = currentProject;
    const story = await Story.detailedView({ creator, project });
    const transformedStory = story.detailedTransform();
    res.json(transformedStory);
  } catch (error) {
    next(error);
  }
};


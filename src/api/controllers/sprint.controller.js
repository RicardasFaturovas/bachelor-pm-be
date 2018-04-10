const httpStatus = require('http-status');
const {
  append,
  times,
  map,
  union,
  without,
} = require('ramda');

const Sprint = require('../models/sprint.model');
const Story = require('../models/story.model');
const Project = require('../models/project.model');

/**
 * Get sprint list
 * @public
 */
exports.getSprintList = async (req, res, next) => {
  try {
    const currentProject = await Project.get(req.params.projectId);
    const { _id: project } = currentProject;
    const sprints = await Sprint.list({ project });
    const transformedSprints = map(sprint => sprint.transform(), sprints);
    res.json(transformedSprints);
  } catch (error) {
    next(error);
  }
};
/**
 * Create new sprint
 * @public
 */
exports.createSprints = async (req, res, next) => {
  try {
    const project = await Project.get(req.params.projectId);
    const time = req.body.sprintTime;
    const latestSprint = await Sprint.findLatest();

    const sprints = latestSprint ?
      times(indicator => new Sprint({
        time,
        indicator: indicator + latestSprint.indicator + 1,
        state: 'todo',
        project: project._id,
      }), req.body.sprintCount) :
      times(indicator => new Sprint({
        time,
        indicator,
        state: 'todo',
        project: project._id,
      }), req.body.sprintCount);

    const savedSprints = await Promise.all(map(async (sprint) => {
      const savedSprint = await sprint.save();
      return savedSprint ? 'success' : 'error';
    }, sprints));

    if (!savedSprints.includes('error')) {
      const sprintIds = map(sprint => sprint._id, sprints);
      project.sprints = append(...sprintIds, project.sprints);
      await project.save();
    }

    res.status(httpStatus.CREATED);
    res.json(map(sprint => sprint.transform(), sprints));
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing sprint
 * @public
 */
exports.updateSprint = async (req, res, next) => {
  try {
    const currentProject = await Project.get(req.params.projectId);
    const { _id: project } = currentProject;
    const sprint = await Sprint.get(project, req.params.sprintIndicator);

    if (req.body.stories) {
      const storyIds = await Promise.all(map(async story =>
        Story.getIfExists(story), req.body.stories));
      const nonNullStories = without([null], storyIds);
      const updatedStories = map(story =>
        Object.assign(story, { sprint: sprint._id }), without([null], nonNullStories));

      await Promise.all(map(async story => story.save(), updatedStories));

      const sprintStoryIds = sprint.stories.map(el => el.toString());
      const addedStoryIds = map(story => story.id, nonNullStories);
      sprint.stories = union(sprintStoryIds, addedStoryIds);
    }

    const { state } = req.body;
    const updateSprint = state ?
      Object.assign(sprint, { state }) :
      sprint;

    const savedSprint = await updateSprint.save();
    const updatedSprint = await Sprint.getOne(savedSprint.id);
    res.json(updatedSprint.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Delete sprint
 * @public
 */
exports.removeSprint = async (req, res, next) => {
  try {
    const currentProject = await Project.get(req.params.projectId);
    const { _id: project } = currentProject;
    const sprint = await Sprint.get(project, req.params.sprintIndicator);

    const removedSprint = sprint.remove();
    removedSprint
      .then(() => res.status(httpStatus.NO_CONTENT).end());
  } catch (error) {
    next(error);
  }
};


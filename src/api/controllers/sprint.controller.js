const httpStatus = require('http-status');
const {
  append,
  times,
  map,
  union,
  omit,
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

    const sprints = times(indicator => new Sprint({
      time,
      indicator: latestSprint ? indicator + latestSprint.indicator + 1 : indicator,
      state: 'todo',
      project: project._id,
    }), req.body.sprintCount);

    await Sprint.insertMany(sprints);

    const sprintIds = map(sprint => sprint._id, sprints);
    project.sprints = append(...sprintIds, project.sprints);
    await project.save();

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
      const stories = await Story.getMultipleById(req.body.stories);
      if (stories) {
        const updatedStories = map(story =>
          Object.assign(story, { sprint: sprint._id }), stories);

        await Story.updateMany(updatedStories);

        const sprintStoryIds = sprint.stories.map(el => el.toString());
        const addedStoryIds = map(story => story.id, stories);
        sprint.stories = union(sprintStoryIds, addedStoryIds);
      }
    }
    const updateSprint = Object.assign(sprint, omit(['stories'], req.body));

    const savedSprint = await updateSprint.save();
    const requeriedSprint = await Sprint.getOne(savedSprint.id);
    res.json(requeriedSprint.transform());
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


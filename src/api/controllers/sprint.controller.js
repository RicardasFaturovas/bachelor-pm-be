const httpStatus = require('http-status');
const {
  append,
  times,
  map,
  assoc,
} = require('ramda');

const Sprint = require('../models/sprint.model');
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

    sprint.stories = req.body.stories && append(req.body.stories, sprint.stories);
    const { state } = req.body;
    const updateSprint = state ? assoc('state', state, sprint) : sprint;


    const savedSprint = await updateSprint.save();
    res.json(savedSprint.transform());
  } catch (error) {
    next(error);
  }
};

const httpStatus = require('http-status');
const {
  append,
  times,
  map,
  reduce,
  union,
  omit,
} = require('ramda');

const Sprint = require('../models/sprint.model');
const Story = require('../models/story.model');
const Bug = require('../models/bug.model');
const Project = require('../models/project.model');
const { storyPoints } = require('../models/storyPoints.schema');

const updateStories = async (requestStories, sprint) => {
  const updatedSprint = sprint;
  const stories = await Story.getMultipleById(requestStories);

  if (stories) {
    // update stories with sprint id
    const updatedStories = map(story =>
      Object.assign(story, { sprint: updatedSprint._id }), stories);
    await Story.updateMany(updatedStories);

    // update sprint with new stories
    const sprintStoryIds = map(el => el.toString(), updatedSprint.stories);
    const addedStoryIds = map(story => story.id, stories);
    updatedSprint.stories = union(sprintStoryIds, addedStoryIds);
  }
};

const updateBugs = async (requestBugs, sprint) => {
  const updatedSprint = sprint;
  const bugs = await Bug.getMultipleById(requestBugs);

  if (bugs) {
    // update bugs with sprint id
    const updatedBugs = map(story =>
      Object.assign(story, { sprint: updatedSprint._id }), bugs);
    await Bug.updateMany(updatedBugs);

    // update sprint with new bugs
    const sprintBugIds = map(el => el.toString(), updatedSprint.bugs);
    const addedBugIds = map(story => story.id, bugs);
    updatedSprint.bugs = union(sprintBugIds, addedBugIds);
  }
};

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
    const latestSprint = await Sprint.findLatest(project.id);
    const sprints = times(indicator => new Sprint({
      time,
      remainingSize: { 1: 0 },
      indicator: latestSprint.length ? indicator + latestSprint[0].indicator + 1 : indicator,
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

    if (req.body.stories && req.body.stories.length) {
      await updateStories(req.body.stories, sprint);
    }
    if (req.body.bugs && req.body.bugs.length) {
      await updateBugs(req.body.bugs, sprint);
    }

    const dayToEdit = sprint.sprintStartDate ?
      (new Date().getDay() - sprint.sprintStartDate.getDay()) + 1 :
      1;
    const updatedSprintStories = await Story.getMultipleNotDoneById(sprint.stories);

    const totalAddedStoryPoints = reduce(
      (acc, val) => acc + storyPoints[val.storyPoints], 0, updatedSprintStories);

    // update the story points left by adding all the story points of the newly added bugs
    const updatedSprintBugs = await Bug.getMultipleNotDoneById(sprint.bugs);
    const totalAddedBugPoints = reduce(
      (acc, val) => acc + storyPoints[val.bugPoints], 0, updatedSprintBugs);

    sprint.remainingSize = Object.assign(sprint.remainingSize,
      { [dayToEdit]: totalAddedBugPoints + totalAddedStoryPoints });

    if (req.body.state === 'inProgress') {
      sprint.sprintStartDate = new Date();
    }

    const updateSprint = Object.assign(sprint, omit(['stories'], req.body));
    const savedSprint = await updateSprint.save();
    res.json(savedSprint.transform());
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

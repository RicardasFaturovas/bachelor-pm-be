const httpStatus = require('http-status');
const {
  append,
  merge,
  map,
  omit,
  pathOr,
  takeLast,
} = require('ramda');
const User = require('../models/user.model');
const Project = require('../models/project.model');
const Sprint = require('../models/sprint.model');
const Bug = require('../models/bug.model');
const { storyPoints } = require('../models/storyPoints.schema');
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
      Math.max(...map(bug => takeLast(4, bug.code), project.bugs)) :
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
 * Get bug list by sprint
 * @public
 */
exports.getScrumboardBugData = async (req, res, next) => {
  try {
    const bugs = await Bug.scrumboardList(req.params.sprintId, req.params.assigneeId);
    const transformedBugs = map(bug => bug.transform(), bugs);

    res.json(transformedBugs);
  } catch (error) {
    next(error);
  }
};

/**
 * Get bug summary details
 * @public
 */
exports.getBugSummary = async (req, res, next) => {
  try {
    const bug = await Bug.detailedView(req.params.bugId);
    const transformedBug = bug.transform();
    res.json(transformedBug);
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing bug
 * @public
 */
exports.updateBug = async (req, res, next) => {
  try {
    const bug = await Bug.get(req.params.bugId);

    let assignee = await User.getIfExists(req.body.assignee);
    if (!assignee) assignee = req.user;
    bug.assignee = assignee._id;

    // if user updates a state to done, remove story points from sprint
    if (req.body.state === 'done' && bug.state !== 'done') {
      const sprint = await Sprint.getByBug(req.params.bugId);
      const dayToEdit = sprint.sprintStartDate ?
        (new Date().getDay() - sprint.sprintStartDate.getDay()) + 1 :
        1;
      let currentStoryPointsLeft = pathOr(0, ['remainingSize', dayToEdit], sprint);
      currentStoryPointsLeft -= storyPoints[bug.bugPoints];
      sprint.remainingSize = Object.assign(
        sprint.remainingSize,
        { [dayToEdit]: currentStoryPointsLeft },
      );
      await sprint.save();
    }

    // if user updates a state to not done, add the story points back to the sprint
    if (req.body.state && req.body.state !== 'done' && bug.state === 'done') {
      const sprint = await Sprint.getByBug(req.params.bugId);
      const dayToEdit = sprint.sprintStartDate ?
        (new Date().getDay() - sprint.sprintStartDate.getDay()) + 1 :
        1;
      let currentStoryPointsLeft = pathOr(0, ['remainingSize', dayToEdit], sprint);
      currentStoryPointsLeft += storyPoints[bug.bugPoints];
      sprint.remainingSize = Object.assign(
        sprint.remainingSize,
        { [dayToEdit]: currentStoryPointsLeft },
      );
      await sprint.save();
    }

    const updatedBug = Object.assign(bug, omit(['assignee'], req.body));

    const savedBug = await updatedBug.save();
    res.json(savedBug.transform());
  } catch (error) {
    next(error);
  }
};

/**
 * Delete bug
 * @public
 */
exports.removeBug = async (req, res, next) => {
  try {
    const bug = await Bug.get(req.params.bugId);
    const removedBug = bug.remove();
    removedBug
      .then(() => res.status(httpStatus.NO_CONTENT).end());
  } catch (error) {
    next(error);
  }
};

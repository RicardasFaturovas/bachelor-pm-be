const httpStatus = require('http-status');
const {
  append,
  merge,
  map,
  union,
  omit,
  without,
} = require('ramda');

const Project = require('../models/project.model');
const User = require('../models/user.model');

/**
 * Create new project
 * @public
 */
exports.createProject = async (req, res, next) => {
  try {
    const { _id: creator } = req.user;
    let users = [];

    if (req.body.users && req.body.users.length) {
      users = await User.getMultipleByEmail(req.body.users);
    }
    const userIds = users.length ? map(el => el._id, users) : [];
    const { user } = req;
    const project = new Project(merge(req.body, { creator, users: userIds }));

    if (users.length) {
      const updatedUsers = map(userObj =>
        Object.assign(userObj, { projects: append(project.id, user.projects) }), users);
      await User.updateMany(updatedUsers);
    }

    user.projects = append(project._id, user.projects);
    project.users = append(user._id, project.users);

    await user.save();
    const savedProject = await project.save();

    res.status(httpStatus.CREATED);
    res.json(savedProject.summaryTransform());
  } catch (error) {
    next(error);
  }
};

/**
 * Get project list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const { _id: creator } = req.user;
    const projects = await Project.list({ creator });
    const transformedProjects = map(project => project.transform(), projects);
    res.json(transformedProjects);
  } catch (error) {
    next(error);
  }
};

/**
 * Get project list
 * @public
 */
exports.getProjectList = async (req, res, next) => {
  try {
    const { _id: creator } = req.user;
    const queryOptions = merge(req.query, { creator });
    const projects = await Project.list(queryOptions);
    const transformedProjects = map(project => project.summaryTransform(), projects);
    res.json(transformedProjects);
  } catch (error) {
    next(error);
  }
};

/**
 * Get project details
 * @public
 */
exports.getProjectDetails = async (req, res, next) => {
  try {
    const project = await Project.getProjectDetails(req.params.id);

    res.json(project.detailsTransform());
  } catch (error) {
    next(error);
  }
};

/**
 * Delete project
 * @public
 */
exports.removeProject = async (req, res, next) => {
  try {
    const project = await Project.get(req.params.id);
    const removedProject = project.remove();
    removedProject
      .then(() => res.status(httpStatus.NO_CONTENT).end());
  } catch (error) {
    next(error);
  }
};

/**
 * Update existing project
 * @public
 */
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.get(req.params.id);
    if (req.body.users) {
      const users = await User.getMultipleById(req.body.users);
      if (users) {
        const updatedUsers = map((user) => {
          const userProjectIds = user.projects.map(el => el.toString());
          return Object.assign(user, { projects: union(userProjectIds, [project.id]) });
        }, users);
        await User.updateMany(updatedUsers);

        const projectUserIds = project.users.map(el => el.toString());
        const addedUserIds = map(user => user.id, users);
        project.users = union(projectUserIds, addedUserIds);
      }
    }
    const updatedProject = Object.assign(project, omit(['users'], req.body));

    const savedProject = await updatedProject.save();
    const requeriedProject = await Project.getOne(savedProject.id);
    res.json(requeriedProject.transform());
  } catch (error) {
    next(error);
  }
};

exports.removeUserFromProject = async (req, res, next) => {
  try {
    const project = await Project.get(req.params.id);
    if (map((el => el.toString()), project.users).includes(req.body.user)) {
      const user = await User.get(req.body.user);
      if (user) {
        const updatedUser = Object.assign(user, { project: null });

        await updatedUser.save();

        const updatedtUserIds = without([req.body.user], map(el => el.toString(), project.users));
        project.users = updatedtUserIds;
      }
    }
    const updatedProject = Object.assign(project, omit(['users'], req.body));

    const savedProject = await updatedProject.save();
    const requeriedProject = await Project.getOne(savedProject.id);
    res.json(requeriedProject.transform());
  } catch (error) {
    next(error);
  }
};


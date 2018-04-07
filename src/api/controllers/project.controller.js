const httpStatus = require('http-status');
const { append, merge, map } = require('ramda');

const Project = require('../models/project.model');

/**
 * Create new project
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const { _id: creator } = req.user;
    const users = [{ _id: creator }];
    const project = new Project(merge(req.body, { creator, users }));

    const { user } = req;
    user.projects = append(project, user.projects);

    await user.save();
    const savedProject = await project.save();

    res.status(httpStatus.CREATED);
    res.json(savedProject.transform());
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
    const projects = await Project.list(req.query);
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
    const transformedProjects = map(project => project.transform(), projects);
    res.json(transformedProjects);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete project
 * @public
 */
exports.remove = async (req, res, next) => {
  try {
    const { _id: creator } = req.user;
    const project = await Project.get(req.query.name, creator);
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
exports.update = async (req, res, next) => {
  try {
    const { _id: creator } = req.user;
    const project = await Project.get(req.body.name, creator);
    const updatedProject = Object.assign(project, req.body);

    const savedProject = await updatedProject.save();
    res.json(savedProject.transform());
  } catch (error) {
    next(error);
  }
};


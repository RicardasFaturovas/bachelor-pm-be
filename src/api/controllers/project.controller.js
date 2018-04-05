const httpStatus = require('http-status');
const { append, merge, map } = require('ramda');

const Project = require('../models/project.model');

/**
 * Create new project
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const { _id: creatorId } = req.user;
    const users = [{ _id: creatorId }];
    const project = new Project(merge(req.body, { creatorId, users }));
    const savedProject = await project.save();

    const user = { req };
    user.projects = append(project, user.projects);
    user.save();

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

exports.getProjectList = async (req, res, next) => {
  try {
    const { _id: creatorId } = req.user;
    const queryOptions = merge(req.query, { creatorId });
    const projects = await Project.list(queryOptions);
    const transformedProjects = map(project => project.transform(), projects);
    res.json(transformedProjects);
  } catch (error) {
    next(error);
  }
};

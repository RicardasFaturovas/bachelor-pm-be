const httpStatus = require('http-status');
const R = require('ramda');

const Project = require('../models/project.model');

/**
 * Create new project
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const { _id: creatorId } = req.user;
    const users = [{ _id: creatorId }];
    const project = new Project(R.merge(req.body, { creatorId, users }));
    const savedProject = await project.save();
    req.user.projects.push(project);
    req.user.save();

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
    const transformedProjects = R.map(project => project.transform(), projects);
    res.json(transformedProjects);
  } catch (error) {
    next(error);
  }
};

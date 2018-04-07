const express = require('express');
const controller = require('../../controllers/project.controller');
const validate = require('express-validation');
const { authorize } = require('../../middlewares/auth');
const { createProject, updateProject } = require('../../validations/project.validation');

const router = express.Router();

router
  .route('/')
  /**
   * @api {get} v1/projects List Projects
   * @apiDescription Get a list of projects
   * @apiVersion 1.0.0
   * @apiName ListProjects
   * @apiGroup Project
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Projects per page
   * @apiParam  {String}             [name]       Project's name
   * @apiParam  {String}             [email]      Project's email
   * @apiParam  {String=user,admin}  [role]       Project's role
   *
   * @apiSuccess {Object[]} projects List of projects.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(controller.list);

router
  .route('/project-list')
  /**
   * @api {get} v1/projects List User Projects
   * @apiDescription Get a list of the current users projects
   * @apiVersion 1.0.0
   * @apiName ListUserProjects
   * @apiGroup Project
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Projects per page
   *
   * @apiSuccess {Object[]} projects List of current user projects.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(authorize(), controller.getProjectList);

router
  .route('/create-project')
  /**
   * @api {post} v1/projects/create-project Create Project
   * @apiDescription Create a new project
   * @apiVersion 1.0.0
   * @apiName CreateProject
   * @apiGroup Project
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  Users's access token
   *
   * @apiParam  {String}             name           Project name
   * @apiParam  {Date}               startDate      Project start date, default current time
   * @apiParam  {User[]}             users          Project list of user ids
   * @apiParam  {String}             description    Project description
   *
   * @apiSuccess (Created 201) {String}  name       Project's name
   * @apiSuccess (Created 201) {String}  creatorId  Creator's id
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   */
  .post(authorize(), validate(createProject), controller.create);

router
  .route('/delete-project')
  /**
   * @api {delete} v1/projects/delete-project Delete Project
   * @apiDescription Delete an existing project
   * @apiVersion 1.0.0
   * @apiName DeleteProject
   * @apiGroup Project
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  Users's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can delete the data
   * @apiError (Not Found 404)    NotFound      Project does not exist
   */
  .delete(authorize(), controller.remove);

router
  .route('/update-project')
  .patch(authorize(), validate(updateProject), controller.update);

module.exports = router;

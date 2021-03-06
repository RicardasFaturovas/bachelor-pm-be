const express = require('express');
const controller = require('../../controllers/project.controller');
const validate = require('express-validation');
const { authorize } = require('../../middlewares/auth');
const { createProject, updateProject, removeUser } = require('../../validations/project.validation');

const router = express.Router();

router
  .route('/project-list')
  /**
   * @api {get} v1/projects/project-list List User Projects
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
   */
  .get(authorize(), controller.getProjectList);

router
  .route('/:id/project-details')
  /**
   * @api {get} v1/projects/:id/project-details Get Projects details
   * @apiDescription Get the details of the current project
   * @apiVersion 1.0.0
   * @apiName GetProjectDetails
   * @apiGroup Project
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Project} Project details
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(authorize(), controller.getProjectDetails);

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
   * @apiParam  {String}  name          Project name
   * @apiParam  {String}  code          Project code
   * @apiParam  {Date}    startDate     Project start date, default current time
   * @apiParam  {User[]}  users         Project list of user ids
   * @apiParam  {String}  description   Project description
   *
   * @apiSuccess (Created 201) {String}  name       Project's name
   * @apiSuccess (Created 201) {String}  creatorId  Creator's id
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   */
  .post(authorize(), validate(createProject), controller.createProject);

router
  .route('/:id/delete-project')
  /**
   * @api {delete} v1/projects/:id/delete-project Delete Project
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
  .delete(authorize(), controller.removeProject);

router
  .route('/:id/update-project')
  /**
   * @api {patch} v1/projects/:id/update-project Update Project
   * @apiDescription Update some fields of a project document
   * @apiVersion 1.0.0
   * @apiName UpdateProject
   * @apiGroup Project
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiParam  {String}  name          Project name
   * @apiParam  {Date}    startDate     Project start date, default current time
   * @apiParam  {User[]}  users         Project list of user ids
   * @apiParam  {String}  description   Project description
   *
   * @apiSuccess (Created 201) {String}  name       Project's name
   * @apiSuccess (Created 201) {String}  creatorId  Creator's id
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Not Found 404)    NotFound     User does not exist
   * @apiError (Not Found 404)    NotFound     Project does not exist
   */
  .patch(authorize(), validate(updateProject), controller.updateProject);

router
  .route('/:id/remove-user')
  /**
   * @api {patch} v1/projects/:id/remove-user Remove user from project
   * @apiDescription Remove a user from a project
   * @apiVersion 1.0.0
   * @apiName RemoveUserFromProject
   * @apiGroup Project
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiParam  {String}  user          User id
   *
   * @apiSuccess (Created 201) {String}  name       Project's name
   * @apiSuccess (Created 201) {String}  creatorId  Creator's id
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Not Found 404)    NotFound     User does not exist
   * @apiError (Not Found 404)    NotFound     Project does not exist
   */
  .patch(authorize(), validate(removeUser), controller.removeUserFromProject);

module.exports = router;

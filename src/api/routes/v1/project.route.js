const express = require('express');
const controller = require('../../controllers/project.controller');
const { authorize } = require('../../middlewares/auth');


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
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated projects can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(controller.list)
  /**
   * @api {post} v1/projects Create Project
   * @apiDescription Create a new project
   * @apiVersion 1.0.0
   * @apiName CreateProject
   * @apiGroup Project
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  Users's access token
   *
   * @apiParam  {String}             name     Project name

   *
   * @apiSuccess (Created 201) {String}  name       Project's name
   * @apiSuccess (Created 201) {String}  creatorId  Creator's id
   * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated projects can create the data
   * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
   */
  .post(authorize(), controller.create);

module.exports = router;

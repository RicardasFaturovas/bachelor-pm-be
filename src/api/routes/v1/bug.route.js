const express = require('express');
const controller = require('../../controllers/bug.controller');
const validate = require('express-validation');
const { authorize } = require('../../middlewares/auth');
const { createBug, updateBug } = require('../../validations/bug.validation');

const router = express.Router();

router
  .route('/:projectId/bug-list')
  /**
   * @api {get} v1/bugs/:projectId/buglist List all project bugs
   * @apiDescription Get a list of the current bugs in the project backlog
   * @apiVersion 1.0.0
   * @apiName ListProjectbugs
   * @apiGroup Bug
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Bug[]} List of current project bugs
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(authorize(), controller.getBugList);

router
  .route('/:projectId/create-bug')
  /**
   * @api {post} v1/bugs/:projectId/create-project Create Bug
   * @apiDescription Create a new bug for the current project
   * @apiVersion 1.0.0
   * @apiName CreateBug
   * @apiGroup Bug
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  Users's access token
   *
   * @apiParam  {String}  name          Bug name
   * @apiParam  {String}  priority      Bug priority
   * @apiParam  {String}  state         Bug state
   * @apiParam  {String}  assignee      Bug assignee id
   * @apiParam  {String}  description   Bug description
   *
   * @apiSuccess (Created 201) {String}  name          Bug name
   * @apiSuccess (Created 201) {String}  priority      Bug priority
   * @apiSuccess (Created 201) {String}  state         Bug state
   * @apiSuccess (Created 201) {String}  assignee      Bug assignee
   * @apiSuccess (Created 201) {String}  description   Bug description
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   */
  .post(authorize(), validate(createBug), controller.createBug);

router
  .route('/:sprintId/scrumboard-details')
  /**
   * @api {post} v1/bugs/:sprintId/scrumboard-details Get Scrumboard details
   * @apiDescription Create a new bug for the current project
   * @apiVersion 1.0.0
   * @apiName CreateBug
   * @apiGroup Bug
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  Users's access token
   *
   * @apiParam  {String}  name          Bug name
   * @apiParam  {String}  priority      Bug priority
   * @apiParam  {String}  state         Bug state
   * @apiParam  {String}  assignee      Bug assignee id
   * @apiParam  {String}  description   Bug description
   *
   * @apiSuccess (Created 201) {String}  name          Bug name
   * @apiSuccess (Created 201) {String}  name          Bug name
   * @apiSuccess (Created 201) {String}  priority      Bug priority
   * @apiSuccess (Created 201) {String}  state         Bug state
   * @apiSuccess (Created 201) {String}  assignee      Bug assignee
   * @apiSuccess (Created 201) {String}  description   Bug description
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   */
  .get(authorize(), controller.getScrumboardBugData);

router
  .route('/:bugId/summary')
  /**
   * @api {get} v1/bugs/:bugId/ Get bug summary
   * @apiDescription Get detailed bug summary
   * @apiVersion 1.0.0
   * @apiName GetBugSummary
   * @apiGroup Bug
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  Users's access token
   *
   * @apiSuccess {String}  id             Bug id
   * @apiSuccess {String}  name           Bug name
   * @apiSuccess {String}  code           Bug code
   * @apiSuccess {String}  priority       Bug priority
   * @apiSuccess {String}  state          Bug state
   * @apiSuccess {Object}  estimatedTime  Bug estimatedTime
   *  {days: Number, hours: Number, minutes: Number}
   * @apiSuccess {Object}  loggedTime     Bug loggedTime
   *  {days: Number, hours: Number, minutes: Number}
   * @apiSuccess {Objcet}  assiginee      Bug assiginee id, name, lastName
   * @apiSuccess {Objcet}  creator        Bug creator id, name, lastName
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(authorize(), controller.getBugSummary);

router
  .route('/:bugId/update-bug')
  /**
   * @api {patch} v1/bugs/:bugId/update-bug Update bug
   * @apiDescription Update bug document
   * @apiVersion 1.0.0
   * @apiName UpdateBug
   * @apiGroup Bug
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  Users's access token
   *
   * @apiParam  {String}  name          Bug name
   * @apiParam  {String}  priority      Bug priority
   * @apiParam  {String}  state         Bug state
   * @apiParam  {String}  assignee      Bug assignee id
   * @apiParam  {String}  description   Bug description
   * @apiParam  {String}  estimatedTime Bug estimated time object
   *  {days: Number, hours: Number, minutes: Number}
   *
   * @apiSuccess {String}  id             Bug id
   * @apiSuccess {String}  name           Bug name
   * @apiSuccess {String}  code           Bug code
   * @apiSuccess {String}  priority       Bug priority
   * @apiSuccess {String}  state          Bug state
   * @apiSuccess {TimeObj} estimatedTime  Bug estimatedTime
   * @apiSuccess {TimeObj} loggedTime     Bug loggedTime
   * @apiSuccess {Objcet}  assiginee      Bug assiginee id, name, lastName
   * @apiSuccess {Objcet}  creator        Bug creator id, name, lastName
   * @apiParam   {Object}  estimatedTime  Bug estimated time object
   *  {days: Number, hours: Number, minutes: Number}
   * @apiSuccess {Date}    createdAt      Timestamp
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .patch(authorize(), validate(updateBug), controller.updateBug);

router
  .route('/:bugId/delete-bug')
  /**
   * @api {patch} v1/bugs/:bugId/delete-bug Delete bug
   * @apiDescription Delete bug document
   * @apiVersion 1.0.0
   * @apiName DeleteBug
   * @apiGroup Bug
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  Users's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .delete(authorize(), controller.removeBug);

module.exports = router;

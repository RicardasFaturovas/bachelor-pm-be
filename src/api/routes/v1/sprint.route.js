const express = require('express');
const controller = require('../../controllers/sprint.controller');
const validate = require('express-validation');
const { authorize } = require('../../middlewares/auth');
const { createSprints, updateSprint } = require('../../validations/sprint.validation');

const router = express.Router();

router
  .route('/:projectId/sprint-list')
  /**
   * @api {get} v1/sprints/:projectId/sprint-list List all project sprints
   * @apiDescription Get a list of the current sprints in the project
   * @apiVersion 1.0.0
   * @apiName ListProjectSprints
   * @apiGroup Sprint
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Sprint[]} List of current project stories
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(authorize(), controller.getSprintList);

router
  .route('/:projectId/create-sprints')
  /**
   * @api {post} v1/sprints/:projectId/create-sprints Create Story
   * @apiDescription Create new sprints for the current project
   * @apiVersion 1.0.0
   * @apiName CreateSorints
   * @apiGroup Sprint
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  Users's access token
   *
   * @apiParam  {Number}  sprintCount   Amount of sprints to create
   * @apiParam  {Object}  sprintTime    Object showing sprint time in days: ex: {days: 4}
   *
   * @apiSuccess (Created 201) {Number}   sprintCount    Amount of sprints created
   * @apiSuccess (Created 201)  {Object}  sprintTime    Object showing sprint time in days:
   *  ex: {days: 4}
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   */
  .post(authorize(), validate(createSprints), controller.createSprints);

router
  .route('/:projectId/:sprintIndicator/update-sprint')
  /**
   * @api {patch} v1/sprints/:projectId/:sprintIndicator/update-sprint Update sprint
   * @apiDescription Update sprint document
   * @apiVersion 1.0.0
   * @apiName UpdateSprint
   * @apiGroup Sprint
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  Users's access token
   *
   * @apiParam  {String[]}  stories       List of story id's
   * @apiParam  {String}    state         State of sprint
   *
   * @apiSuccess {String}  id             Sprint id
   * @apiSuccess {Number}  indicator      Sprint indicator
   * @apiSuccess {TimeObj} time           Sprint time {days: Number}
   * @apiSuccess {String}  state          Sprint state
   * @apiSuccess {String}  project        Project containing the sprint id
   * @apiSuccess {Object}  period         Sprint period in days {startTime: Number, endTime: Number}
   * @apiSuccess {Objcet}  chartData      Sprint chart data
   *  {totalStoryEstimatedTime: TimeOjb, totalStoryLoggedTime: TimeOjb}
   * @apiSuccess {Date}    createdAt      Timestamp
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .patch(authorize(), validate(updateSprint), controller.updateSprint);

router
  .route('/:projectId/:sprintIndicator/delete-sprint')
  /**
   * @api {patch} v1/stories/:projectId/:sprintIndicator/delete-sprint Delete sprint
   * @apiDescription Delete sprint document
   * @apiVersion 1.0.0
   * @apiName DeleteSprint
   * @apiGroup Sprint
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  Users's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .delete(authorize(), controller.removeSprint);

module.exports = router;

const express = require('express');
const controller = require('../../controllers/story.controller');
const validate = require('express-validation');
const { authorize } = require('../../middlewares/auth');
const { createStory, updateStory } = require('../../validations/story.validation');

const router = express.Router();

router
  .route('/:projectId/story-list')
  /**
   * @api {get} v1/stories/:projectId/storylist List all project stories
   * @apiDescription Get a list of the current stories in the project backlog
   * @apiVersion 1.0.0
   * @apiName ListProjectStories
   * @apiGroup Story
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Story[]} List of current project stories
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(authorize(), controller.getStoryList);

router
  .route('/:projectId/create-story')
  /**
   * @api {post} v1/stories/:projectId/create-project Create Story
   * @apiDescription Create a new story for the current project
   * @apiVersion 1.0.0
   * @apiName CreateStory
   * @apiGroup Story
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  Users's access token
   *
   * @apiParam  {String}  name          Story name
   * @apiParam  {String}  priority      Story priority
   * @apiParam  {String}  storyPoints   Story storyPoints
   * @apiParam  {String}  state         Story state
   * @apiParam  {String}  assignee      Story assignee id
   * @apiParam  {String}  description   Story description
   *
   * @apiSuccess (Created 201) {String}  name          Story name
   * @apiSuccess (Created 201) {String}  name          Story name
   * @apiSuccess (Created 201) {String}  priority      Story priority
   * @apiSuccess (Created 201) {String}  storyPoints   Story storyPoints
   * @apiSuccess (Created 201) {String}  state         Story state
   * @apiSuccess (Created 201) {String}  assignee      Story assignee
   * @apiSuccess (Created 201) {String}  description   Story description
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   */
  .post(authorize(), validate(createStory), controller.createStory);

router
  .route('/:projectId/:storyCode/summary')
  /**
   * @api {get} v1/stories/:projectId/:storyCode/ Get story summary
   * @apiDescription Get detailed story summary
   * @apiVersion 1.0.0
   * @apiName GetStorySummary
   * @apiGroup Story
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  Users's access token
   *
   * @apiSuccess {String}  id             Story id
   * @apiSuccess {String}  name           Story name
   * @apiSuccess {String}  code           Story code
   * @apiSuccess {String}  priority       Story priority
   * @apiSuccess {String}  state          Story state
   * @apiSuccess {Object} estimatedTime  Story estimatedTime
   *  {days: Number, hours: Number, minutes: Number}
   * @apiSuccess {Object} loggedTime     Story loggedTime
   *  {days: Number, hours: Number, minutes: Number}
   * @apiSuccess {Objcet}  assiginee      Story assiginee id, name, lastName
   * @apiSuccess {Objcet}  creator        Story creator id, name, lastName
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(authorize(), controller.getStorySummary);

router
  .route('/:projectId/:storyCode/update-story')
  /**
   * @api {patch} v1/stories/:projectId/:storyCode/update-story Update story
   * @apiDescription Update story document
   * @apiVersion 1.0.0
   * @apiName UpdateStory
   * @apiGroup Story
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  Users's access token
   *
   * @apiParam  {String}  name          Story name
   * @apiParam  {String}  priority      Story priority
   * @apiParam  {String}  storyPoints   Story storyPoints
   * @apiParam  {String}  state         Story state
   * @apiParam  {String}  assignee      Story assignee id
   * @apiParam  {String}  description   Story description
   * @apiParam  {String}  estimatedTime Story estimated time object
   *  {days: Number, hours: Number, minutes: Number}
   *
   * @apiSuccess {String}  id             Story id
   * @apiSuccess {String}  name           Story name
   * @apiSuccess {String}  code           Story code
   * @apiSuccess {String}  priority       Story priority
   * @apiSuccess {String}  state          Story state
   * @apiSuccess {TimeObj} estimatedTime  Story estimatedTime
   * @apiSuccess {TimeObj} loggedTime     Story loggedTime
   * @apiSuccess {Objcet}  assiginee      Story assiginee id, name, lastName
   * @apiSuccess {Objcet}  creator        Story creator id, name, lastName
   * @apiParam   {Object}  estimatedTime  Story estimated time object
   *  {days: Number, hours: Number, minutes: Number}
   * @apiSuccess {Date}    createdAt      Timestamp
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .patch(authorize(), validate(updateStory), controller.updateStory);

router
  .route('/:projectId/:storyCode/delete-story')
  /**
   * @api {patch} v1/stories/:projectId/:storyCode/delete-story Delete story
   * @apiDescription Delete story document
   * @apiVersion 1.0.0
   * @apiName DeleteStory
   * @apiGroup Story
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  Users's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .delete(authorize(), controller.removeStory);

module.exports = router;

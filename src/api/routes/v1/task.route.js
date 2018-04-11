const express = require('express');
const controller = require('../../controllers/task.controller');
const validate = require('express-validation');
const { authorize } = require('../../middlewares/auth');
const { createTask, updateTask } = require('../../validations/task.validation');

const router = express.Router();

router
  .route('/:storyId/task-list')
  /**
   * @api {get} v1/tasks/:storyId/storylist List all tasks in story
   * @apiDescription Get a list of the current task in the story.
   * @apiVersion 1.0.0
   * @apiName ListStoryTasks
   * @apiGroup Task
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {Task[]} List of current tasks in story
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .get(authorize(), controller.getTaskList);

router
  .route('/:storyId/create-task')
  /**
   * @api {post} v1/tasks/:storyId/create-task Create Task
   * @apiDescription Create a new task for the current story
   * @apiVersion 1.0.0
   * @apiName CreateTask
   * @apiGroup Task
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  Users's access token
   *
   * @apiParam  {String}  name          Task name
   * @apiParam  {String}  priority      Task priority
   * @apiParam  {String}  assignee      Task assignee id
   * @apiParam  {String}  description   Task description
   *
   * @apiSuccess (Created 201) {String}  name          Task name
   * @apiSuccess (Created 201) {String}  priority      Task priority
   * @apiSuccess (Created 201) {String}  state         Task state
   * @apiSuccess (Created 201) {String}  assignee      Task assignee
   * @apiSuccess (Created 201) {String}  description   Task description
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
   */
  .post(authorize(), validate(createTask), controller.createTask);

router
  .route('/:taskId/update-task')
  /**
   * @api {patch} v1/tasks/:taskId/supdate-story Update story
   * @apiDescription Update task document
   * @apiVersion 1.0.0
   * @apiName UpdateTask
   * @apiGroup Story
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  Users's access token
   *
   * @apiParam  {String}  name          Task name
   * @apiParam  {String}  priority      Task priority
   * @apiParam  {String}  state         Task state
   * @apiParam  {String}  assignee      Task assignee id
   * @apiParam  {String}  description   Task description
   * @apiParam  {String}  estimatedTime Task estimated time object
   *  {days: Number, hours: Number, minutes: Number}
   * @apiParam  {String}  loggedTime Task logged time object
   *  {days: Number, hours: Number, minutes: Number}
   *
   * @apiSuccess {String}  id             Task id
   * @apiSuccess {String}  name           Task name
   * @apiSuccess {String}  code           Task code
   * @apiSuccess {String}  priority       Task priority
   * @apiSuccess {String}  state          Task state
   * @apiSuccess {TimeObj} estimatedTime  Task estimatedTime
   * @apiSuccess {TimeObj} loggedTime     Task loggedTime
   * @apiSuccess {Objcet}  assiginee      Task assiginee id, name, lastName
   * @apiSuccess {Objcet}  creator        Task creator id, name, lastName
   * @apiParam   {Object}  estimatedTime  Task estimated time object
   *  {days: Number, hours: Number, minutes: Number}
   * @apiParam   {Object}  loggedTime     Task logged time object
   *  {days: Number, hours: Number, minutes: Number}
   * @apiSuccess {Date}    createdAt      Timestamp
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .patch(authorize(), validate(updateTask), controller.updateTask);

router
  .route('/:taskId/delete-task')
  /**
   * @api {patch} v1/tasks/:taskId/sdelete-story Delete task
   * @apiDescription Delete task document
   * @apiVersion 1.0.0
   * @apiName DeleteTask
   * @apiGroup Task
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  Users's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   */
  .delete(authorize(), controller.removeTask);
module.exports = router;

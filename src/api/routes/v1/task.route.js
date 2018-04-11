const express = require('express');
const controller = require('../../controllers/task.controller');
const validate = require('express-validation');
const { authorize } = require('../../middlewares/auth');
const { createTask } = require('../../validations/task.validation');

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
   * @api {post} v1/stories/:storyId/create-task Create Task
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
module.exports = router;

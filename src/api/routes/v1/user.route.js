const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/user.controller');
const { authorize } = require('../../middlewares/auth');
const {
  updateUser,
  updateUserPassword,
  getUsersByEmail,
} = require('../../validations/user.validation');

const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */
router.param('userId', controller.load);

router
  .route('/profile')
  /**
   * @api {get} v1/users/profile User Profile
   * @apiDescription Get logged in user profile information
   * @apiVersion 1.0.0
   * @apiName UserProfile
   * @apiGroup User
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess {String}  id         User's id
   * @apiSuccess {String}  name       User's name
   * @apiSuccess {String}  email      User's email
   * @apiSuccess {String}  role       User's role
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated Users can access the data
   */
  .get(authorize(), controller.loggedIn);

router
  .route('/find-users')
  /**
   * @api {get} v1/users/find-users Find Users
   * @apiDescription Get users by emaail query
   * @apiVersion 1.0.0
   * @apiName GetUsersByEmail
   * @apiGroup User
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiParam  {String}   email      User's email to query by
   *
   * @apiSuccess {String}  id         User's id
   * @apiSuccess {String}  name       User's name
   * @apiSuccess {String}  lastName   User's last name
   * @apiSuccess {String}  email      User's email
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated Users can access the data
   */
  .post(authorize(), validate(getUsersByEmail), controller.getUsersByEmail);

router
  .route('/:projectId/find-users')
  /**
   * @api {get} v1/users/:projectId/find-users Find Users in project
   * @apiDescription Get users assigned to project by email substring
   * @apiVersion 1.0.0
   * @apiName GetProjectUsersByEmail
   * @apiGroup User
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiParam  {String}   email      User's email to query by
   *
   * @apiSuccess {String}  id         User's id
   * @apiSuccess {String}  name       User's name
   * @apiSuccess {String}  lastName   User's last name
   * @apiSuccess {String}  email      User's email
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated Users can access the data
   */
  .post(authorize(), validate(getUsersByEmail), controller.getProjectUsersByEmail);

router
  .route('/update-password')
  /**
   * @api {patch} v1/users/update-password Update password
   * @apiDescription Update current user's password
   * @apiVersion 1.0.0
   * @apiName UpdateUserPassword
   * @apiGroup User
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiParam  {String{6..128}}     oldPassword    User's current password
   * @apiParam  {String{6..128}}     newPassword    User's new password
   *
   * @apiSuccess {String}  success    true if successful

   * @apiError (Bad Request 400)  ValidationError  Some parameters contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Unauthorized 401) Unauthorized Old password is incorrect
   * @apiError (Not Found 404)    NotFound     User does not exist
   */
  .patch(authorize(), validate(updateUserPassword), controller.updatePassword);

router
  .route('/update-user')
  /**
   * @api {patch} v1/users/update-user Update User
   * @apiDescription Update some fields of a user document
   * @apiVersion 1.0.0
   * @apiName UpdateUser
   * @apiGroup User
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiParam  {String}             email     User's email
   * @apiParam  {String{6..128}}     password  User's password
   * @apiParam  {String{..128}}      [name]    User's name
   *
   * @apiSuccess {String}  id         User's id
   * @apiSuccess {String}  name       User's name
   * @apiSuccess {String}  email      User's email
   * @apiSuccess {Date}    createdAt  Timestamp
   *
   * @apiError (Bad Request 400)  ValidationError  Some parameters contain invalid values
   * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
   * @apiError (Not Found 404)    NotFound     User does not exist
   */
  .patch(authorize(), validate(updateUser), controller.update);

router
  .route('/delete-user')
  /**
   * @api {patch} v1/users/delete-user Delete User
   * @apiDescription Delete a user
   * @apiVersion 1.0.0
   * @apiName DeleteUser
   * @apiGroup User
   * @apiPermission user
   *
   * @apiHeader {String} Authorization  User's access token
   *
   * @apiSuccess (No Content 204)  Successfully deleted
   *
   * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can delete the data
   * @apiError (Not Found 404)    NotFound      User does not exist
   */
  .delete(authorize(), controller.remove);

module.exports = router;

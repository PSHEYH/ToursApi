const express = require('express');
const {
  signUp,
  signIn,
  logout,
  forgotPassword,
  resetPassword,
  guard,
  changePassword,
  restrictTo,
} = require('../controllers/authController');

const {
  updateMyData,
  getAllUsers,
  deleteUser,
  getUser,
} = require('../controllers/userController');

const router = express.Router();

router.route('/signup').post(signUp);
router.route('/login').post(signIn);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:token').patch(resetPassword);
router.route('/changePassword').patch(guard, changePassword);
router.route('/changeMyData').patch(guard, updateMyData);
//router.route('/deleteMe').delete(guard, deleteMe);
router.route('/logout').post(logout);
router.route('/').get(getAllUsers);
router
  .route('/:id')
  .delete(guard, restrictTo('admin'), deleteUser)
  .get(getUser);

module.exports = router;

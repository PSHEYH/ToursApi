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
  getMe,
} = require('../controllers/userController');

const router = express.Router();

router.route('/signup').post(signUp);
router.route('/login').post(signIn);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:token').patch(resetPassword);

router.use(guard);

router.route('/changePassword').patch(changePassword);
router.route('/changeMyData').patch(updateMyData);
//router.route('/deleteMe').delete(guard, deleteMe);
router.route('/logout').post(logout);
router.route('/me').get(getMe, getUser);
router.route('/').get(restrictTo('admin'), getAllUsers);
router.route('/:id').delete(restrictTo('admin'), deleteUser);

module.exports = router;

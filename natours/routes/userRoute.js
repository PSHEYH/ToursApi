const express = require('express');
const {
  signUp,
  signIn,
  logout,
  forgotPassword,
  resetPassword,
  guard,
  changePassword,
} = require('../controllers/authController');

const {
  updateMyData,
  deleteMe,
  getAllUsers,
} = require('../controllers/userController');

const router = express.Router();

router.route('/signup').post(signUp);
router.route('/login').post(signIn);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:token').patch(resetPassword);
router.route('/changePassword').patch(guard, changePassword);
router.route('/changeMyData').patch(guard, updateMyData);
router.route('/deleteMe').delete(guard, deleteMe);
router.route('/logout').post(logout);
router.route('/').get(getAllUsers);

module.exports = router;

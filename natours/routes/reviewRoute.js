const express = require('express');
const { guard, restrictTo } = require('../controllers/authController');
const {
  createReview,
  getAllReviews,
} = require('../controllers/reviewController');

const router = express.Router();

router
  .route('/')
  .post(guard, restrictTo('user'), createReview)
  .get(guard, getAllReviews);

module.exports = router;

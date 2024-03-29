const express = require('express');
const { guard, restrictTo } = require('../controllers/authController');
const {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  setTourId,
  getReview,
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(guard, restrictTo('user'), setTourId, createReview)
  .get(getAllReviews);

router
  .route('/:id')
  .get(getReview)
  .delete(guard, restrictTo('user', 'admin'), deleteReview)
  .patch(guard, restrictTo('user', 'admin'), updateReview);

module.exports = router;

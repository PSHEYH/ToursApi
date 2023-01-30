const express = require('express');

const router = express.Router();
const {
  createTour,
  getTourById,
  updateTour,
  deleteTour,
  getAllTours,
  topFiveTours,
  aggregationTours,
  toursByYear,
  getToursWithin,
  getDistances,
} = require('../controllers/tourController');
const reviewRouter = require('./reviewRoute');
const { guard, restrictTo } = require('../controllers/authController');

///router.param('id', checkId);

router.use('/:tourId/reviews', reviewRouter);
router.route('/monthly-plan/:year').get(toursByYear);
router.route('/top-5-tours').get(topFiveTours, getAllTours);
router.route('/tour-stats').get(aggregationTours);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/:id')
  .get(getTourById)
  .patch(guard, restrictTo('admin', 'lead-tour'), updateTour)
  .delete(guard, restrictTo('admin', 'lead-tour'), deleteTour);

router
  .route('/')
  .get(getAllTours)
  .post(guard, restrictTo('admin', 'lead-tour'), createTour);

module.exports = router;

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
} = require('../controllers/tourController');
const { guard, restrictTo } = require('../controllers/authController');
///router.param('id', checkId);
router.route('/monthly-plan/:year').get(toursByYear);
router.route('/top-5-tours').get(topFiveTours, getAllTours);
router.route('/tour-stats').get(aggregationTours);

router
  .route('/:id')
  .get(getTourById)
  .patch(updateTour)
  .delete(guard, restrictTo('admin'), deleteTour);

router.route('/').get(guard, getAllTours).post(createTour);

module.exports = router;

const Review = require('../models/review');
const APIFeatures = require('../utils/api.features');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.setTourId = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  /// for allow nested routes
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const features = new APIFeatures(Review.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const docs = await features.query;

  res.status(200).json({
    status: 'success',
    data: docs,
  });
});
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

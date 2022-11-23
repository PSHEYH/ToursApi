const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();
  res.status(200).json({
    status: 'success',
    data: reviews,
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_KEY);

  const reviewBody = {
    user: decoded.sub,
    tour: req.body.tour_id,
    review: req.body.review,
    rating: req.body.rating,
  };

  const review = await Review.create(reviewBody);
  res.status(201).json({
    status: 'success',
    data: review,
  });
});

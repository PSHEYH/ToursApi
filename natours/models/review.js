const mongoose = require('mongoose');
const Tour = require('./tour');
const User = require('./user');

const reviewSchema = mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Must have a review'],
  },
  rating: {
    type: Number,
    required: [true, 'Review must have a rating'],
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'Review must belong to tour'],
    ref: Tour,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: User,
    required: [true, 'Review must belong to user'],
  },
});

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

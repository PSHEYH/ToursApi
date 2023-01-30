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

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

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

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

reviewSchema.post('save', function () {
  /// this.constructor creates an instance of Review
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.updatedReview = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
  await this.updatedReview.constructor.calcAverageRatings(
    this.updatedReview.tour
  );
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

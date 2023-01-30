const mongoose = require('mongoose');
const { default: slugify } = require('slugify');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have name'],
      maxlength: [30, 'Length of name must be less than 30'],
      minlength: [10, 'Length of name must be higher than 10'],
      unique: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    difficulty: {
      type: String,
      null: false,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is is either easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5'],
      default: 4.5,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
      unique: false,
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTours: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      description: String,
      address: String,
    },
    location: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        description: String,
        address: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ difficulty: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

//// Virtual properties (Computed fields)
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

/// Virtual populating
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTours: { $ne: true } });
  this.start = new Date();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query executing ${Date.now() - this.start}`);
  next();
});

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTours: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

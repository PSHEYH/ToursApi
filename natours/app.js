const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoute');
const errorController = require('./controllers/errorController');

const app = express();

app.use(helmet());

app.use(express.json({ limit: '20kb' }));

app.use(mongoSanitize());

app.use(xss());

app.use(express.static(`${__dirname}/public`));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!',
});

app.use('/api', limiter);
app.use((req, res, next) => {
  console.log('Hello from midleware');
  req.requestedAt = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
// });

app.use(errorController);

module.exports = app;

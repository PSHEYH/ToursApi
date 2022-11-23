const AppError = require('../utils/app.errors');

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 404);
};

const handleDublicateDB = (err) => {
  const value = err.keyValue.name;
  const message = `Dublicate value: ${value}. Please use another value.`;
  return new AppError(message, 404);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} ${err.value}`;
  return new AppError(message, 400);
};
const handleJWTError = (err) => new AppError('Invalid jwt token', 401);
const handleExpiredError = (err) => new AppError('Token is expired', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProduction = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      err: err,
    });
  } else {
    //console.log('ERROR', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV.trim() === 'production') {
    const errorName = err.name;
    let error = { ...err };
    // eslint-disable-next-line no-prototype-builtins
    if (errorName === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDublicateDB(error);
    }
    if (errorName === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (errorName === 'JsonWebTokenError') {
      error = handleJWTError(error);
    }
    if (errorName === 'TokenExpiredError') {
      error = handleExpiredError(error);
    }
    sendErrorProduction(error, res);
  }
};

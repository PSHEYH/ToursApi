const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const md5 = require('md5');
const { promisify } = require('util');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/app.errors');
const sendEmail = require('../utils/email');

const createToken = (id) =>
  jwt.sign(
    {
      sub: id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 43200,
    },
    process.env.JWT_KEY
  );

const createRefreshToken = (id) => {
  const refreshKey = crypto
    .randomBytes(Math.ceil(64 / 2))
    .toString('hex')
    .slice(0, 64);
  return jwt.sign(
    {
      sub: id,
      refreshKey: refreshKey,
    },
    process.env.JWT_KEY
  );
};

const createSendToken = (res, user, statusCode) => {
  const accessToken = createToken(user.id);

  const refreshToken = createRefreshToken(user.id);
  const cookiesOptions = {
    maxAge: process.env.JWT_COOKIES_EXPIRES_IN * 24 * 3600 * 1000,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookiesOptions.secure = true;
  res.cookie('jwt', accessToken, cookiesOptions);
  res.status(statusCode).json({
    status: 'success',
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
};

exports.signIn = catchAsync(async (req, res, next) => {
  const properties = ['email', 'password'];
  properties.forEach((el) => {
    // eslint-disable-next-line no-prototype-builtins
    if (!req.body.hasOwnProperty(el)) {
      return next(new AppError(`Property ${el} doesnt exist`, 400));
    }
  });
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('User doesnt exist', 401));
  }
  const userPassword = md5(password + process.env.SALT);
  if (userPassword !== user.password) {
    return next(new AppError('Wrong password', 401));
  }

  createSendToken(res, user, 201);
});

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  createSendToken(res, user, 201);
});

exports.logout = catchAsync(async () => {});

exports.refreshToken = catchAsync(async () => {});

exports.guard = catchAsync(async (req, res, next) => {
  //// Checking token, valdation token
  if (!req.headers.authorization) {
    return next(new AppError('Unauthorized', 401));
  }
  if (!req.headers.authorization.startsWith('Bearer')) {
    return next(new AppError('Malfored authorization token'), 401);
  }
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_KEY);
  const user = await User.findById(decoded.sub);
  if (!user) {
    return next(new AppError('Not found', 400));
  }
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User changed password. Please log in again', 401)
    );
  }

  req.user = user;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have a permission to this route', 403)
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('User didnt exist', 404));
  }
  const resetToken = user.createPasswordResentToken();
  user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/forgotPassword/${resetToken}`;
  try {
    sendEmail({
      email: user.email,
      subject: 'Restore password',
      text: `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to  ${resetUrl}. \n If you didnt, please ignore this email`,
    });

    res.status(200).json({
      status: 'success',
      message: 'Reset token is send',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpired = undefined;
    user.save({ validateBeforeSave: false });
    next(
      new AppError('There are was an error sending email. Try again later', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.passwordResetExpired < Date.now()) {
    return next(new AppError('Reset token is expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpired = undefined;
  await user.save();
  createSendToken(res, user, 201);
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  const hashedPassword = md5(req.body.currentPassword + process.env.SALT);
  if (hashedPassword !== user.password) {
    return next(new AppError('Wrong password', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(res, user, 200);
});

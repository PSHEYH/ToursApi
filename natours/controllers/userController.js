const User = require('../models/user');
const AppError = require('../utils/app.errors');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObject = (obj, ...allowFields) => {
  const resultObj = {};
  allowFields.forEach((el) => {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(el)) {
      resultObj[el] = obj[el];
    }
  });
  return resultObj;
};

exports.updateMyData = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route are not for changing password', 400));
  }

  const filteredBody = filterObject(req.body, 'name', 'email');
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  user.name = req.body.name;
  res.status(200).json({
    status: 'success',
    message: 'message',
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);

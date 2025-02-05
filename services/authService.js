//authService.js
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const UserModel = require("../models/userModel");
const ApiFeatures = require("../utils/apiFeatures");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");
const {sanitizeUser}= require('../utils/sanitizeData');
// @desc    Forgot password
// @route   Post /api/v1/auth/signUp
// @access  Public
exports.signUp = asyncHandler(async (req, res, next) => {   
  //create user
  const user = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  //create a jwt for this user
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "2h",
  });
  //return the response to client side
  res.status(201).json({ data: sanitizeUser(user), token });
});

// @desc    logIn
// @route   Post /api/v1/auth/logIn
// @access  Public
exports.logIn = asyncHandler(async (req, res, next) => {
  //1) check that email exist and the password is correct
  const user = await UserModel.findOne({ email: req.body.email });
  console.log(`user: ${user}`);
  
  if (!user || !(await bcrypt.compare(req.body.password, user.password)))
    return next(new Error("invalid email or password"));

  //2) generate a token for this user
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "2h",
  });

  //3) send response back to client side.
  res.status(200).json({ data: sanitizeUser(user), token });
});

// @desc make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) cheak weather a token is sent in the headers.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  )
    token = req.headers.authorization.split(" ")[1];

  if (!token)
    return next(new ApiError("Not logged in, please logIn first", 401));
  console.log("entered the protect rrr");

  // 2) verify weather this token is valid(not changed and not expired).
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); //?
  console.log("reached after decoded");

  // 3) cheak if user of this token still exists.
  const user = await UserModel.findById(decoded.userId);
  if (!user)
    return next(
      new ApiError("The user that belong to this token does no longer exist"),
      401
    );

  // 4) cheak if user change his password after token is created.
  if (user.passwordChangedAt) {
    const passwordChangedAtTimeStamp = parseInt(
      user.passwordChangedAt.getTime() / 1000,
      10
    ); //?
    if (passwordChangedAtTimeStamp > decoded.iat)
      return next(new ApiError("password changed. Please logIn again"), 401);
  }
  // 5) Cheack weather user is active or not
  if (!user.active) return next(new ApiError("This user is not active"), 401);

  req.user = user; //?
  console.log("reached the next() in protect");

  next();
});

// @specify the logged routes that user can access
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // cheack weather user.role exist in roles
    if (!roles.includes(req.user.role))
      //?
      return next(
        new ApiError("you are not permitted to access this route", 403)
      );
    next();
  });

// @desc    Forgot password
// @route   Post /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user by email (to ensure email is correct).
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user)
    return next(new ApiError(`No user for this email ${req.body.email}`));

  // 2) If user exists, Generate random 6 digits and save it in db.
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  user.save();

  // 3) Send the reset code via email.
  try {
    await sendEmail({
      email: req.body.email,
      subject: `ResetCode message (valid for 10 min)`,
      message: `Hi ${user.name}\n We recieved a request to reset the password on E-shop Account. \n ${resetCode}\n Enter this code to change the password`,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    return next(new ApiError("An error in sending ResetCode", 500));
  }

  res.status(200).json({ status: `ResetCode sent to ${req.body.email}` });
});

// @desc    Forgot password
// @route   Post /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  const hash = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await UserModel.findOne({
    passwordResetCode: hash,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) return next(new ApiError("ResetCode is wrong or expired"), 400);
  user.passwordResetVerified = true;
  user.save();
  res.status(200).json({ status: "success" });
});

// @desc    Reset the password
// @route   Put /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user)
    return next(
      new ApiError(`No user found for this email ${req.body.email}`, 404)
    );

  //check if resetCode is verified
  if (!user.passwordResetVerified)
    return next(new ApiError(`passwordResetCode not verified`, 400));

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();

  const token = createToken(user._id);
  res.status(200).json({ token });
});

//notices
/*
The protect function is wrapped with asyncHandler.
This utility catches any error that occurs in an asynchronous function
and forwards it to the next middleware by calling next(error).
Any error passed to next() middleware is handled by the golbalError.
In summary, the error generated by jwt.verify() is caught by asyncHandler and
passed to the golbalError middleware, which is responsible for sending a 
consistent error response to the client based on weather we are in dev or prod environment.
//////////////////////
decoded=> contains the decoded token containing the payload and the expire_date
//////////////////////
parseInt()=>  ensure that the result is an integer by discarding any decimal part.
10 => called the radix which is the base of the number system.
this means that the number being parsed is in decimal (base-10).
//////////////////////
req.user= user; ==> add user object to req since we will need it in the allowedTo middleware
//////////////////////
req.user--> user object has been added to req in the end of the 'protect' middlewaare
*/

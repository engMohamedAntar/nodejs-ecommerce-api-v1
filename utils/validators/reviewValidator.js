const { check } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const ReviewModel = require("../../models/reviewModel");
const ApiError = require("../ApiError");

exports.createReviewValidator = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("ratings value required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Ratings value must be between 1 to 5"),
  check("user").isMongoId().withMessage("invalid user id format")
    .custom((val,{req})=>{
      //ensure that the entered user id is the same as the logged user id
      if(req.user._id.toString() !== req.body.user.toString())
          throw new Error('You can not create a review for other users, Enter logged user id');
      return true;
    }),
  check("product")
    .isMongoId()
    .withMessage("invalid product id format")
    .custom((val, { req }) => {
      // Check if logged user create review before
      return ReviewModel.findOne({user: req.user._id,product: req.body.product}).then((review) =>{
        if (review)
          return Promise.reject(new Error("You reviewed this product before"));
      });
    }),
  validatorMiddleware,
];

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid review id format"),
  validatorMiddleware,
];

exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("invalid review id format")
    .custom((val, { req }) =>
      ReviewModel.findById(val).then((review) => {
        if (!review)
          return Promise.reject(new Error("there is no review with this id"));

        if (review.user._id.toString() !== req.user._id.toString())
          return Promise.reject(
            new Error("you are not allowed to update this review")
          );
      })
    ),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("invalid review id format")
    .custom((val, { req }) => {
      if (req.user.role === "user") {
        return ReviewModel.findById(val).then((review) => {
          if (!review)
            return Promise.reject(new Error("there is no review with this id"));

          //ensure that logged user is the user who is deleting the review
          if (review.user._id.toString() !== req.user._id.toString())
            return Promise.reject(
              new Error("you are not allowed to delete this review")
            );
        });
      }
      return true;
    }),
  validatorMiddleware,
];

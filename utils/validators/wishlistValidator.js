const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.addProductToWishlistValidator = [
  check("productId")
    .notEmpty().withMessage("productId is required")
    .isMongoId().withMessage("productId sent in the body not valid"),
    validatorMiddleware
];

exports.removeProductFromWishlistValidator = [
  check("productId")
    .isMongoId().withMessage("productId sent in params not valid"),
    validatorMiddleware
];


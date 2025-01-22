//addressValiator.js
const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.addAddressValidator = [
  check("phone")
    .isMobilePhone(["ar-EG","ar-SA"]).withMessage('this is not a valid phone number'),
  check("postalCode")
  .matches(/^\d{5}$/).withMessage('this is not a valid postalCode'), //?
  validatorMiddleware
];

exports.removeAddressValidator = [
  check("addressId")
    .isMongoId().withMessage("addressId isn't a valid mongoId"),
    validatorMiddleware
];

//notices
/*
.matches(/^\d{5}$/) ==> i'm using matches instead of isPostalCode because the
 isPostalCode() method in the validator library does not have support for 'EG' (Egypt)
 as a valid locale. The valid locales are limited to certain countries like "US", "GB",
etc., as defined in the library.
*/
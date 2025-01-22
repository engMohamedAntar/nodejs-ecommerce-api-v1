const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const CouponModel = require("../../models/couponModel");

exports.createCouponValidator = [
  check("name") //validate that name is unique
    .custom(async (val, { req }) => {
      const coupon = await CouponModel.findOne({ name: val });
      console.log(`val: ${val}`);
      console.log(`coupon: ${coupon}`);

      if (coupon) throw new Error("this name exist before");
      return true;
    }),
  validatorMiddleware,
];

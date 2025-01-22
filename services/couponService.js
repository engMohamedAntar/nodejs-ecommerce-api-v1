//couponService.js
const CouponModel= require('../models/couponModel');
const factory= require('./handlersFactory');

// @desc get all coupons
// @route Get api/v1/coupons
// @access private/admin
exports.getCoupons= factory.getAll(CouponModel);

// @desc get single coupon
// @route Get api/v1/coupons/:id
// @access private/admin
exports.getCoupon= factory.getOne(CouponModel);

// @desc create a coupon
// @route Post api/v1/coupons
// @access private/admin
exports.createCoupon= factory.createOne(CouponModel);

// @desc update a coupon
// @route Put api/v1/coupons/:id
// @access private/admin
exports.updateCoupon= factory.updateOne(CouponModel);

// @desc get all coupons
// @route Delete api/v1/coupons/:id
// @access private/admin
exports.deleteCoupon= factory.deleteOne(CouponModel);


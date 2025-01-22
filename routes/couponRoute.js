const express= require('express');
const router= express.Router();
const {protect,allowedTo}= require('../services/authService');

const {getCoupon, getCoupons, updateCoupon, createCoupon, deleteCoupon}= require('../services/couponService');
const {createCouponValidator}= require('../utils/validators/couponValidator');
router.use(protect, allowedTo('admin'));

router.route('/')
    .get(getCoupons)
    .post(createCouponValidator, createCoupon)
router.route('/:id')
    .get(getCoupon)
    .put(updateCoupon)
    .delete(deleteCoupon)

module.exports= router;
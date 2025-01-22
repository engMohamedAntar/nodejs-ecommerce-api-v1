//cartRoute.js
const express= require('express');
const router= express.Router();
const {addProductToCart, getLoggedUserCart, removeItemFromCart, clearCart, updateCartItemQuantiy, applyCoupon}= require('../services/cartService');
const {protect, allowedTo}= require('../services/authService');
const {addProductToCartValidator}= require('../utils/validators/cartValidator');

router.use(protect, allowedTo('user') );

router.route('/')
    .post(addProductToCartValidator, addProductToCart)
    .get(getLoggedUserCart)
    .delete(clearCart)

router.put('/applyCoupon', applyCoupon)

router.route('/:itemId')
    .put(updateCartItemQuantiy)
    .delete(removeItemFromCart)

module.exports= router;

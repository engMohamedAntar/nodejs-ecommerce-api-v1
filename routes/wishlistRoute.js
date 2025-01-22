//wishlistRoute.js
const express = require('express');
const router = express.Router();
const { protect, allowedTo } = require('../services/authService');
const { addProductToWishlist, removeProductFromWishlist, getLoggedUserWishlist } = require('../services/whishlistService');
const {addProductToWishlistValidator, removeProductFromWishlistValidator}= require('../utils/validators/wishlistValidator')

router.use(protect, allowedTo('user'));
router.route('/')
    .post(addProductToWishlistValidator, addProductToWishlist)
    .get( getLoggedUserWishlist)
router.route('/:productId')
    .delete(removeProductFromWishlistValidator, removeProductFromWishlist);

module.exports = router;

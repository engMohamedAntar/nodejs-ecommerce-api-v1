/* eslint-disable no-plusplus */
const asyncHandler = require("express-async-handler");
const CartModel = require("../models/cartModel");
const Product = require("../models/productModel");
const CouponModel = require("../models/couponModel");

const ApiError = require("../utils/ApiError");

const calcTotalPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
};

// @desc Add product to cart
// @route Post /api/v1/cart
// @access Private/User
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;

  const product = await Product.findById(productId);

  let cart = await CartModel.findOne({ user: req.user._id });

  //if no cart exist for logged user
  if (!cart) {
    cart = await CartModel.create({
      user: req.user._id,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  } else {
    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );
    //product exist before
    if (itemIndex > -1) cart.cartItems[itemIndex].quantity++;
    else
      cart.cartItems.push({ product: productId, color, price: product.price });
  }

  //calculate total price
  calcTotalPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "product added successfully to cart",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Get logged_user cart
// @route Get /api/v1/cart
// @access Private/User
exports.getLoggedUserCart = asyncHandler(
  asyncHandler(async (req, res, next) => {
    const cart = await CartModel.findOne({ user: req.user._id });
    if (!cart) {
      return next(new ApiError("No cart found for this user", 404));
    }

    cart.totalPriceAfterDiscount = undefined;

    res.status(200).json({
      status: "success",
      numOfCartItems: cart.cartItems.length,
      data: cart,
    });
  })
);

// @desc remove item from cart
// @route PUT /api/v1/cart/:itemId
// @access Private/User
exports.removeItemFromCart = asyncHandler(
  asyncHandler(async (req, res, next) => {
    const cart = await CartModel.findOneAndUpdate(
      { user: req.user._id },
      {
        $pull: { cartItems: { _id: req.params.itemId } },
      },
      { new: true }
    );
    calcTotalPrice(cart);
    cart.save();

    res.status(200).json({
      status: "success",
      numOfCartItems: cart.cartItems.length,
      data: cart,
    });
  })
);

// @desc clear the logged user cart items
// @route PUT /api/v1/cart
// @access Private/User
exports.clearCart = asyncHandler(async (req, res, next) => {
  await CartModel.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});

// @desc update quantity of an item
// @route PUT /api/v1/cart/:itemId
// @access Private/User
exports.updateCartItemQuantiy = asyncHandler(async (req, res, next) => {
  const cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) return next(new ApiError("No Cart found for this user", 404));
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (itemIndex < 0)
    return next(new ApiError("No cartItem found for this id", 404));
  cart.cartItems[itemIndex].quantity = req.body.quantity;
  calcTotalPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Apply coupon to cart
// @route PUT /api/v1/cart/coupon
// @access Privat/User
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  //get the coupon and check weather it's valid
  const coupon = await CouponModel.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });
  if (!coupon) return next(new ApiError("coupon is invalid or expired", 400));

  // 2) Get logged user cart
  const cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) return next(new ApiError("No cart found for this user", 404));

  const totalPrice = cart.totalCartPrice;
  const totalPriceAfterDiscount =
    totalPrice - (totalPrice * coupon.discount) / 100;
  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;

  await cart.save();

  res
    .status(200)
    .json({
      status: "sucess",
      numOfCartItems: cart.cartItems.length,
      data: cart,
    });
});

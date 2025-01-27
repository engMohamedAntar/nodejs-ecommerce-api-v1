//orderService.js
const AsyncHandler = require("express-async-handler");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const CartModel = require("../models/cartModel");
const ApiError = require("../utils/ApiError");
const OrderModel = require("../models/orderModel");
const ProductModel = require("../models/productModel");
const UserModel = require("../models/userModel");
const factory = require("./handlersFactory");

// @desc create a cash order
// @route POST api/v1/orders/cartId
// @access Protected/User
exports.createCashOrder = AsyncHandler(async (req, res, next) => {
  const shippingPrice = 0;
  const taxPrice = 0;
  // 1) Find cart based on cartId coming from req.params
  const cart = await CartModel.findById(req.params.cartId);
  if (!cart) return next(new ApiError("cart not found", 404));
  // 2) Calc totalOrderPrice
  const totalCartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const totalOrderPrice = totalCartPrice + shippingPrice + taxPrice;
  // 3) Create a new order
  const order = await OrderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  // 4) for each product in the cartItems increment its sold and decrement its quantiy
  if (order) {
    const bulkOperations = cart.cartItems.map((item) => {// ?
      
      return {
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
        },
      };
    });
    await ProductModel.bulkWrite(bulkOperations);
    // 5) clear the cart
    await CartModel.findByIdAndDelete(req.params.cartId);

    res.status(201).json({ status: "success", data: order });
  }
});

// ?
exports.filterOrderForLoggedUser = AsyncHandler((req, res, next) => {
  if (req.user.role === "user") {
    req.filterObj = { user: req.user._id };
  }
  next();
});

// @desc find all orders
// @route Get api/v1/orders
// @access Protected/User-Admin-Manager
exports.getAllOrders = factory.getAll(OrderModel);

//ensure that only the user who own this order can find it. //?
exports.ensureOrderOwnership = AsyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) return next(new ApiError("Order not found", 404));
  if (req.user.role === "user" && order.user._id.toString() !== req.user.id)
    return next(
      new ApiError("You are not authorized to access this order", 403)
    );
  next();
});

// @desc find specific order
// @route Get api/v1/orders/:id
// @access Protected/User-Admin-Manager
exports.getSpecificOrder = factory.getOne(OrderModel);

// @desc update order status to paid
// @route Put api/v1/orders/:id/pay
// @access Private/Admin-manager
exports.updateOrderToPaid = AsyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) return next(new ApiError("order not found", 404));

  order.isPaid = true;
  order.paidAt = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({ status: "success", data: updatedOrder });
});

// @desc update order status
// @route Put api/v1/orders/:id/deliver
// @access Private/Admin-manager
exports.updateOrderToDeliverd = AsyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) return next(new ApiError("order not found", 404));

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  const updatedOrder = await order.save();
  console.log("antar");

  res.status(200).json({ status: "success", data: updatedOrder });
});

// @desc create a checkout session
// @route POST api/v1/orders/checkoutSession/:cartId
// @access Protect/user
exports.createCheckoutSession = AsyncHandler(async (req, res, next) => {
  //calc totalCartPrice
  const taxPrice = 0;
  const shippingPrice = 0;
  const cart = await CartModel.findById(req.params.cartId);
  if (!cart) return next(new ApiError("Cart not found", 404));
  const totalCartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const totalOrderPrice = totalCartPrice + taxPrice + shippingPrice;

  //create a session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: `Order by ${req.user.name}`,
          },
          unit_amount: totalOrderPrice * 100,
        },
        quantity: 1,
      },
    ],

    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/api/v1/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/v1/cart`,
    client_reference_id: req.params.cartId,
    customer_email: req.user.email,
    metadata: req.body.shippingAddress,
  });

  res.status(200).json({ status: "success", session });
});

//create a card order to use in the checkoutWebhook
const createCardOrder = AsyncHandler(async (session) => {
  const cartId = session.client_reference_id;
  const cart = await CartModel.findById(cartId);
    
  const totalOrderPrice = session.amount_total / 100;
  const user = await UserModel.findOne({ email: session.customer_email });

  const order = await OrderModel.create({
    user: user._id,
    cartItems: cart.cartItems,
    paymentMethod: "card",
    shippingAddress: session.metadata,
    totalOrderPrice,
    isPaid: true,
    paidAt: Date.now(),
  });

  //for each product in the cartItems update its quantity and sold
  if(order) {
    const bulkOperations= cart.cartItems.map((item)=>{
      return {
        updateOne: {
          filter: {_id: item.product},
          update: { $inc: {quantity: -item.quantity, sold: +item.quantity}}
        }
      }
    }
  )
    await ProductModel.bulkWrite(bulkOperations);    
  }
});

// @desc This webhook will run when stripe payment is success
// @route POST /checkout-webhook --> this route exist in server.js file
// @access Protected/User
exports.checkoutWebhook = (req, res, next) => {
  console.log('Entered checkoutWebhook');
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    createCardOrder(event.data.object);
  }
  console.log('every thing is ok dudes');
  res.status(200).json({ received: true, antoor: "zeroo" });
};













//notices
// (item) => ({}) is the same as (item)=> { return {} }
// bulkOperations will be an array of objects each object contains the operations on a specific item

// filterOrderForLoggedUser ==> filter the returned orders in case getAll for the user(return only the orders for logged user not all the orders)

/* 
 ensureOrderOwnership => the getSpecificOrder route could be accessed by admin, manager, and the user
 who owns that order so in case the loggedIn user isn't the owner of this order ensureOrderOwnership will 
 prevent the user from accessing it 
*/

/*
  //deprecated syntax for line_items
  // line_items: [
  //   {
  //     name: req.user.name,
  //     amount: totalOrderPrice * 100,
  //     currency: 'egp',
  //     quantity: 1,
  //   }
  // ],
*/

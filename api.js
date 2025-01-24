//orderService.js
const AsyncHandler = require("express-async-handler");
const stripe= require('stripe')(process.env.STRIPE_SECRET);
const CartModel = require("./models/cartModel");
const OrderModel = require("./models/orderModel");
const ProductModel = require("./models/productModel");

exports.checkoutWebhook= AsyncHandler(async (req,res,next)=>{
    const sig = req.headers['stripe-signature'];
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
    console.log(event.type);
    if(event.type === 'checkout.session.completed') {
      console.log('Hellow Mohamed');
    }
  });
  
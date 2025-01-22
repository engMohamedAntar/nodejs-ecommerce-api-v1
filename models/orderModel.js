/* eslint-disable prefer-arrow-callback */
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"]
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        color: String,
        price: Number,
        quantity: Number,
      },
    ],
    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
      default: 'cash',
    },
    shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    },
    taxPrice: {
        type: Number, 
        default: 0,
    },
    shippingPrice: {
        type:Number,
        default: 0,
    },
    totalOrderPrice: Number,
    isPaid: {
        type: Boolean,
        default: false,
    },
    paidAt: Date,
    isDelivered: {
        type: Boolean,
        default: false,
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre(/^find/, function(next) {
  this.populate({path: 'user', select:'name profileImage'}).populate({path:'cartItems.product', select:'title'});
  next();
})

module.exports= mongoose.model("Order",orderSchema);
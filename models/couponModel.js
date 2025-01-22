const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "coupon name is required"],
      unique: true,
      trim: true,
    },
    expire: {
        type:Date,
        required: [true, 'expiry date is required']
    },
    discount: {
        type: Number,
        required: [true, 'Coupon discount value is reuired']
    }
  },
  {timestamps: true}
  
);

module.exports= mongoose.model('Coupon', couponSchema);
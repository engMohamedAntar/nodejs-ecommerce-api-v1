/* eslint-disable prefer-arrow-callback */
//reviewModel.js
const mongoose = require("mongoose");
const Product = require("./productModel");
const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "review must belong to a user"],
    },
    ratings: {
      type: Number,
      min: [1, "min rating is 1.0"],
      max: [5, "max rating is 5.0"],
      required: [true, "review ratings required"],
    }, 
    // parent reference (one to many)
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "review must belong to a product"],
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name" });
  next();
});

reviewSchema.statics.calcAverageRatingsAndQuantity = async function (productId) {
  const result = await this.aggregate([
    // Stage 1: get all reviews for a specific product
    {
      $match: { product: productId }, //it's like the where statement in sql
    },
    // Stage 2: Grouping reviews based on product and calculate avgRatings and ratingsQuantity
    {
      $group: {
        _id: "$product",
        avgRatings: { $avg: "$ratings" },
        ratingsQuantity: { $sum: 1 },
      }, //it's like the group_by in sql
    },
  ]);

  console.log(result);
  //update the value of ratingsAverage and ratingsQunatity for the product
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: result[0].avgRatings,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post("save", async function () { //executed when adding or updating a review
  // document-level event (document.save();)
  this.constructor.calcAverageRatingsAndQuantity(this.product);
});

reviewSchema.post("findOneAndDelete", async function (doc) {      //? query-level event (findOneAndDelete is a query that returns a doc)
  await doc.constructor.calcAverageRatingsAndQuantity(doc.product);
});

module.exports = mongoose.model("Review", reviewSchema);






//notices
/*
reviewSchema.post('findOneAndDelete', async function (doc) ==>
  You cannot use 'this' to refer to the document being operated on (since it's a query, not a document).
  Instead, you get the resulting document as the argument in post middleware (as doc in your case).
  The post('findOneAndDelete') middleware gets triggered after the query is executed,
  and Mongoose passes the resulting document (doc) to the middleware.
*/
/*
reviewSchema.post("findOneAndDelete", async function (doc)   ==>
The reason why replacing findOneAndDelete with deleteOne doesn't trigger the post("deleteOne") hook is that
the main difference between findOneAndDelete and deleteOne is that findOndAndDelete returns the deleted document while the deleteOne doesn't


*/

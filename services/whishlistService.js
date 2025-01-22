//wishlistService.js
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc add the req.body.productId to your wishlist (wishlist of logged user)
// @route Post api/v1/wishlist
// @access protected/user
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId }, //? we are inserting an id in the wishlist array
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "product added successfully to your wishlist",
    data: user.whishList,
  });
});


// @desc remove the req.params.productId from your wishlist (wishlist of logged user)
// @route Delete api/v1/wishlist/:id
// @access protected/user
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.productId }, //? we are removing an id from wishlist array
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "product removed successfully from your wishlist",
    data: user.whishList,
  });
});


// @desc get logged user wishlist
// @route Get api/v1/wishlist/
// @access protected/user
exports.getLoggedUserWishlist= asyncHandler(async (req,res,next)=>{
  const user= await User.findById(req.user._id).populate('wishlist');
  console.log(`user: ${user}`);
  
  res.status(200).json({
    status:'success',
    results: user.wishlist.length,
    data:user.wishlist
  })
});






// $addToSet ==> adds the value only once
// $pull ==> removes the value only once

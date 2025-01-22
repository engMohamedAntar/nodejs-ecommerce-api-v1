//wishlistService.js
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc add a new address for logged in user
// @route Post api/v1/addresses
// @access protected/user
exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body }, //we are inserting an object in the addresses array
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "address added successfully",
    data: user.addresses,
  });
});

// @desc remove an address
// @route Delete api/v1/addresses/:id
// @access protected/user
exports.removeAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } }, //? we are removing an object from the addresses array
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "address removed successfully",
    data: user.addresses,
  });
});

// @desc Get logged user addresses
// @route Get api/v1/addresses/
// @access protected/user
exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    status: "success",
    results: user.addresses.length,
    data: user.addresses,
  });
});



//notices
/*
$pull: { addresses: { _id: req.params.addressId } } ===> we are deleting an object from the
addresses array where the _id of this object equals the addressId you have sent in the req paramters
*/